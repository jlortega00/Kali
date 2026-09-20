import type { SupabaseClient } from '@supabase/supabase-js'
import {
  AFFECTION_PER_ACTION,
  applyCareAction,
  computeGrowthStage,
  decayNeeds,
  fullNeeds,
  updateStreakOnVisit,
} from '@/lib/game/logic'
import type { CareAction, EggState, Friendship, Nest, PetState, StreakState, User } from '@/lib/game/types'
import type { GameRepository } from './repository'

/**
 * Implementación real sobre Supabase, escrita contra el esquema de
 * `supabase/migrations/` — no se ha podido probar contra un proyecto real
 * en este entorno (no hay credenciales). Antes de confiar en ella en
 * producción, ejercítala con el checklist de `docs/pet-bible.md` / el flujo
 * demo y revisa especialmente las políticas RLS.
 *
 * La resolución de la eclosión (aleatoriedad de especie + límite diario) se
 * delega en la Edge Function `warm-egg`: es la única forma de que un
 * cliente no pueda manipular el resultado. El resto de escrituras
 * (cuidados, moneda) se hacen aquí directamente contra las tablas,
 * protegidas por RLS; si en el futuro hace falta blindarlas más (por
 * ejemplo, limitar cuántas veces se puede alimentar a la mascota), deberían
 * moverse también a Edge Functions.
 */
export class SupabaseRepository implements GameRepository {
  readonly kind = 'supabase' as const
  private readonly db: SupabaseClient

  constructor(db: SupabaseClient) {
    this.db = db
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await this.db.auth.getUser()
    if (!user) return null
    return this.getUser(user.id)
  }

  async signOut(): Promise<void> {
    await this.db.auth.signOut()
  }

  async getUser(userId: string): Promise<User | null> {
    const { data } = await this.db.from('profiles').select('*').eq('id', userId).maybeSingle()
    return data ? mapUser(data) : null
  }

  async findUserByFriendCode(code: string): Promise<User | null> {
    const { data } = await this.db
      .from('profiles')
      .select('*')
      .eq('friend_code', code.trim().toUpperCase())
      .maybeSingle()
    return data ? mapUser(data) : null
  }

  async listFriendships(userId: string): Promise<Friendship[]> {
    const { data } = await this.db.from('friendships').select('*').or(`user_a.eq.${userId},user_b.eq.${userId}`)
    return (data ?? []).map(mapFriendship)
  }

  async sendFriendRequest(fromUserId: string, friendCode: string): Promise<Friendship> {
    const target = await this.findUserByFriendCode(friendCode)
    if (!target) throw new Error('No existe nadie con ese código de amigo.')
    if (target.id === fromUserId) throw new Error('No puedes añadirte a ti mismo/a.')

    const [userA, userB] = [fromUserId, target.id].sort()
    const { data, error } = await this.db
      .from('friendships')
      .insert({ user_a: userA, user_b: userB, requested_by: fromUserId, status: 'pending' })
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    return mapFriendship(data)
  }

  async respondFriendRequest(friendshipId: string, userId: string, accept: boolean): Promise<Friendship> {
    if (!accept) {
      await this.db.from('friendships').delete().eq('id', friendshipId)
      return { id: friendshipId, userIds: [userId, userId], requestedBy: userId, status: 'blocked', createdAt: new Date().toISOString() }
    }
    const { data, error } = await this.db.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId).select('*').single()
    if (error) throw new Error(error.message)
    return mapFriendship(data)
  }

  async removeFriendship(friendshipId: string, _userId: string): Promise<void> {
    await this.db.from('friendships').delete().eq('id', friendshipId)
  }

  async listMyNests(userId: string): Promise<Nest[]> {
    const { data } = await this.db.from('nests').select('*').or(`member_a.eq.${userId},member_b.eq.${userId}`)
    const nests = await Promise.all((data ?? []).map((row) => this.assembleNest(row)))
    return nests
  }

  async getNest(nestId: string, requesterId: string): Promise<Nest | null> {
    const { data } = await this.db.from('nests').select('*').eq('id', nestId).maybeSingle()
    if (!data || ![data.member_a, data.member_b].includes(requesterId)) return null
    return this.assembleNest(data)
  }

  /** Recarga interna tras una escritura ya autorizada (por RLS o por la Edge Function), sin volver a pedir quién pregunta. */
  private async getNestRaw(nestId: string): Promise<Nest | null> {
    const { data } = await this.db.from('nests').select('*').eq('id', nestId).maybeSingle()
    return data ? this.assembleNest(data) : null
  }

  async createNest(userId: string, friendUserId: string): Promise<Nest> {
    const { data, error } = await this.db
      .from('nests')
      .insert({ member_a: userId, member_b: friendUserId, status: 'incubating' })
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    await this.db.from('eggs').insert({ nest_id: data.id })
    return this.assembleNest(data)
  }

  async warmEgg(nestId: string, _userId: string, _now: string): Promise<Nest> {
    const { error } = await this.db.functions.invoke('warm-egg', { body: { nestId } })
    if (error) throw new Error(error.message)
    const nest = await this.getNestRaw(nestId)
    if (!nest) throw new Error('No se pudo recargar el nido tras incubar.')
    return nest
  }

  async careAction(nestId: string, userId: string, action: Exclude<CareAction, 'warm'>, now: string): Promise<Nest> {
    const { data: petRow } = await this.db.from('pets').select('*').eq('nest_id', nestId).single()
    if (!petRow) throw new Error('Aún no hay ninguna mascota que cuidar en este nido.')

    const decayed = decayNeeds(petRow.needs, petRow.needs_updated_at, now)
    const needs = applyCareAction(decayed, action)
    const affectionPoints = petRow.affection_points + AFFECTION_PER_ACTION[action]
    const stage = computeGrowthStage(petRow.born_at, now, affectionPoints)
    const stageChanged = stage !== petRow.stage

    await this.db
      .from('pets')
      .update({
        needs,
        needs_updated_at: now,
        affection_points: affectionPoints,
        stage,
        ...(stageChanged ? { stage_entered_at: now } : {}),
      })
      .eq('nest_id', nestId)

    await this.db.from('care_logs').insert({ nest_id: nestId, user_id: userId, action })

    const nest = await this.getNestRaw(nestId)
    if (!nest) throw new Error('No se pudo recargar el nido tras cuidar a la mascota.')
    return nest
  }

  async petName(nestId: string, name: string): Promise<Nest> {
    await this.db.from('pets').update({ name: name.slice(0, 20) }).eq('nest_id', nestId)
    const nest = await this.getNestRaw(nestId)
    if (!nest) throw new Error('No se pudo renombrar a la mascota.')
    return nest
  }

  async markVisit(userId: string, now: string): Promise<StreakState> {
    const current = await this.getStreak(userId)
    const updated = updateStreakOnVisit(current, now.slice(0, 10))
    await this.db.from('streaks').upsert({
      user_id: userId,
      count: updated.count,
      last_visit_date: updated.lastVisitDate,
      grace_used_this_week: updated.graceUsedThisWeek,
      week_start_date: updated.weekStartDate,
    })
    return updated
  }

  async getStreak(userId: string): Promise<StreakState> {
    const { data } = await this.db.from('streaks').select('*').eq('user_id', userId).maybeSingle()
    if (!data) return { count: 0, lastVisitDate: null, graceUsedThisWeek: false, weekStartDate: null }
    return {
      count: data.count,
      lastVisitDate: data.last_visit_date,
      graceUsedThisWeek: data.grace_used_this_week,
      weekStartDate: data.week_start_date,
    }
  }

  async getCurrency(userId: string): Promise<number> {
    const { data } = await this.db.from('currency').select('balance').eq('user_id', userId).maybeSingle()
    return data?.balance ?? 0
  }

  async addCurrency(userId: string, amount: number): Promise<number> {
    const current = await this.getCurrency(userId)
    const next = Math.max(0, current + amount)
    await this.db.from('currency').upsert({ user_id: userId, balance: next })
    return next
  }

  async devAdvanceTime(nestId: string, hours: number): Promise<Nest> {
    const { data: petRow } = await this.db.from('pets').select('*').eq('nest_id', nestId).single()
    if (petRow) {
      const shift = (iso: string) => new Date(new Date(iso).getTime() - hours * 3_600_000).toISOString()
      await this.db
        .from('pets')
        .update({
          born_at: shift(petRow.born_at),
          needs_updated_at: shift(petRow.needs_updated_at),
          stage_entered_at: shift(petRow.stage_entered_at),
        })
        .eq('nest_id', nestId)
    }
    const nest = await this.getNestRaw(nestId)
    if (!nest) throw new Error('No se pudo recargar el nido.')
    return nest
  }

  // ---------------------------------------------------------------------

  // Fila cruda de Supabase (tipado laxo a propósito: no generamos tipos desde el esquema en este entorno).
  private async assembleNest(row: any): Promise<Nest> {
    const memberIds: [string, string] = [row.member_a, row.member_b]
    const now = new Date().toISOString()

    if (row.status === 'incubating') {
      const { data: contributions } = await this.db.from('egg_contributions').select('user_id, points, created_at').eq('nest_id', row.id)
      const egg: EggState = { contributions: {}, warmthLog: [], createdAt: row.created_at }
      for (const c of contributions ?? []) {
        egg.contributions[c.user_id] = (egg.contributions[c.user_id] ?? 0) + c.points
        egg.warmthLog.push({ userId: c.user_id, createdAt: c.created_at })
      }
      return { id: row.id, memberIds, createdAt: row.created_at, status: 'incubating', egg, lastSeenAt: {} }
    }

    const { data: petRow } = await this.db.from('pets').select('*').eq('nest_id', row.id).single()
    const pet: PetState | undefined = petRow
      ? {
          speciesId: petRow.species_id,
          name: petRow.name,
          stage: computeGrowthStage(petRow.born_at, now, petRow.affection_points),
          bornAt: petRow.born_at,
          stageEnteredAt: petRow.stage_entered_at,
          affectionPoints: petRow.affection_points,
          needs: decayNeeds(petRow.needs ?? fullNeeds(), petRow.needs_updated_at, now),
          needsUpdatedAt: petRow.needs_updated_at,
          careLog: [],
        }
      : undefined

    return { id: row.id, memberIds, createdAt: row.created_at, status: row.status, pet, lastSeenAt: {} }
  }
}

// Fila cruda de Supabase.
function mapUser(row: any): User {
  return {
    id: row.id,
    username: row.username,
    avatarSeed: row.avatar_seed,
    friendCode: row.friend_code,
    createdAt: row.created_at,
    birthYearConsent: row.birth_year_consent,
  }
}

// Fila cruda de Supabase.
function mapFriendship(row: any): Friendship {
  return {
    id: row.id,
    userIds: [row.user_a, row.user_b],
    requestedBy: row.requested_by,
    status: row.status,
    createdAt: row.created_at,
  }
}

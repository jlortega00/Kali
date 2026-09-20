import { customAlphabet } from 'nanoid'
import { EGG_CONFIG, FRIENDSHIP_CONFIG } from '@/config/gameConfig'
import {
  AFFECTION_PER_ACTION,
  addEggContribution,
  applyCareAction,
  canWarmEggToday,
  computeGrowthStage,
  decayNeeds,
  fullNeeds,
  isEggReadyToHatch,
  resolveHatchSpecies,
  updateStreakOnVisit,
} from '@/lib/game/logic'
import type { CareAction, Friendship, Nest, PetState, StreakState, User } from '@/lib/game/types'
import type { GameRepository } from './repository'

const STORAGE_KEY = 'nidito:demo:v2'
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12)

interface DemoData {
  users: User[]
  friendships: Friendship[]
  nests: Nest[]
  streaks: Record<string, StreakState>
  currency: Record<string, number>
  currentUserId: string | null
}

const EMPTY_STREAK: StreakState = { count: 0, lastVisitDate: null, graceUsedThisWeek: false, weekStartDate: null }

function seed(): DemoData {
  const now = new Date()
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString()

  const userA: User = {
    id: 'demo-a',
    username: 'Tú',
    avatarSeed: 'a-mochi',
    friendCode: 'TUTUTU',
    createdAt: daysAgo(6),
    birthYearConsent: true,
  }
  const userB: User = {
    id: 'demo-b',
    username: 'Alex',
    avatarSeed: 'b-nube',
    friendCode: 'ALEXOK',
    createdAt: daysAgo(6),
    birthYearConsent: true,
  }

  const friendship: Friendship = {
    id: 'friend-ab',
    userIds: [userA.id, userB.id],
    requestedBy: userB.id,
    status: 'accepted',
    createdAt: daysAgo(6),
  }

  const nest: Nest = {
    id: 'nest-1',
    memberIds: [userA.id, userB.id],
    createdAt: daysAgo(1),
    status: 'incubating',
    egg: {
      // Cerca del objetivo a propósito: así en la demo se puede ver la
      // eclosión en un par de clics en vez de esperar 24-48h reales.
      contributions: { [userA.id]: 45, [userB.id]: 35 },
      warmthLog: [
        { userId: userA.id, createdAt: daysAgo(1) },
        { userId: userB.id, createdAt: daysAgo(1) },
      ],
      createdAt: daysAgo(1),
    },
    lastSeenAt: { [userA.id]: daysAgo(0), [userB.id]: daysAgo(0.3) },
  }

  return {
    users: [userA, userB],
    friendships: [friendship],
    nests: [nest],
    streaks: {},
    currency: { [userA.id]: 40, [userB.id]: 40 },
    currentUserId: userA.id,
  }
}

function load(): DemoData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const fresh = seed()
      save(fresh)
      return fresh
    }
    return JSON.parse(raw) as DemoData
  } catch {
    return seed()
  }
}

function save(data: DemoData) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Almacenamiento no disponible (navegación privada, cuota llena, ...): la sesión sigue en memoria.
  }
}

function projectNest(nest: Nest, now: string): Nest {
  if (!nest.pet) return nest
  const needs = decayNeeds(nest.pet.needs, nest.pet.needsUpdatedAt, now)
  const stage = computeGrowthStage(nest.pet.bornAt, now, nest.pet.affectionPoints)
  const pet: PetState = { ...nest.pet, needs, stage }
  return { ...nest, pet }
}

/**
 * Backend local (localStorage) con dos usuarios simulados ya amigos y un
 * nido con un huevo en curso. Permite probar el flujo cooperativo completo
 * sin depender de otra persona: la UI expone un selector "viendo como…"
 * para saltar entre `demo-a` y `demo-b`.
 */
export class DemoRepository implements GameRepository {
  readonly kind = 'demo' as const
  private data: DemoData

  constructor() {
    this.data = typeof window === 'undefined' ? seed() : load()
  }

  private persist() {
    save(this.data)
  }

  // -- Sesión -----------------------------------------------------------

  async getCurrentUser(): Promise<User | null> {
    return this.data.users.find((u) => u.id === this.data.currentUserId) ?? null
  }

  async signOut(): Promise<void> {
    this.data.currentUserId = null
    this.persist()
  }

  /** Solo en modo demo: cambia qué usuario simulado está "activo" para poder probar el flujo tú solo/a. */
  switchDemoUser(userId: string) {
    this.data.currentUserId = userId
    this.persist()
  }

  listDemoUsers(): User[] {
    return this.data.users
  }

  // -- Usuarios / amigos --------------------------------------------------

  async getUser(userId: string): Promise<User | null> {
    return this.data.users.find((u) => u.id === userId) ?? null
  }

  async findUserByFriendCode(code: string): Promise<User | null> {
    const normalized = code.trim().toUpperCase()
    return this.data.users.find((u) => u.friendCode === normalized) ?? null
  }

  async listFriendships(userId: string): Promise<Friendship[]> {
    return this.data.friendships.filter((f) => f.userIds.includes(userId))
  }

  async sendFriendRequest(fromUserId: string, friendCode: string): Promise<Friendship> {
    const target = await this.findUserByFriendCode(friendCode)
    if (!target) throw new Error('No existe nadie con ese código de amigo.')
    if (target.id === fromUserId) throw new Error('No puedes añadirte a ti mismo/a.')

    const existing = this.data.friendships.find((f) => f.userIds.includes(fromUserId) && f.userIds.includes(target.id))
    if (existing) return existing

    const friendship: Friendship = {
      id: nanoid(),
      userIds: [fromUserId, target.id],
      requestedBy: fromUserId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    this.data.friendships.push(friendship)
    this.persist()
    return friendship
  }

  async respondFriendRequest(friendshipId: string, userId: string, accept: boolean): Promise<Friendship> {
    const friendship = this.data.friendships.find((f) => f.id === friendshipId)
    if (!friendship) throw new Error('Esa solicitud ya no existe.')
    if (!friendship.userIds.includes(userId)) throw new Error('No tienes permiso sobre esta solicitud.')
    if (friendship.requestedBy === userId) throw new Error('No puedes responder tu propia solicitud.')

    if (!accept) {
      this.data.friendships = this.data.friendships.filter((f) => f.id !== friendshipId)
      this.persist()
      return { ...friendship, status: 'blocked' }
    }
    friendship.status = 'accepted'
    this.persist()
    return friendship
  }

  async removeFriendship(friendshipId: string, userId: string): Promise<void> {
    const friendship = this.data.friendships.find((f) => f.id === friendshipId)
    if (!friendship || !friendship.userIds.includes(userId)) return
    this.data.friendships = this.data.friendships.filter((f) => f.id !== friendshipId)
    this.persist()
  }

  // -- Nidos --------------------------------------------------------------

  async listMyNests(userId: string): Promise<Nest[]> {
    const now = new Date().toISOString()
    return this.data.nests.filter((n) => n.memberIds.includes(userId)).map((n) => projectNest(n, now))
  }

  async getNest(nestId: string, requesterId: string): Promise<Nest | null> {
    const nest = this.data.nests.find((n) => n.id === nestId)
    if (!nest || !nest.memberIds.includes(requesterId)) return null
    return projectNest(nest, new Date().toISOString())
  }

  async createNest(userId: string, friendUserId: string): Promise<Nest> {
    const friendship = this.data.friendships.find(
      (f) => f.status === 'accepted' && f.userIds.includes(userId) && f.userIds.includes(friendUserId),
    )
    if (!friendship) throw new Error('Solo puedes abrir un nido con un amigo confirmado.')

    const activeCount = (id: string) =>
      this.data.nests.filter((n) => n.memberIds.includes(id) && n.status !== 'memorial').length
    if (activeCount(userId) >= FRIENDSHIP_CONFIG.maxActiveNests) {
      throw new Error(`Ya tienes ${FRIENDSHIP_CONFIG.maxActiveNests} nidos activos, el máximo permitido.`)
    }

    const now = new Date().toISOString()
    const nest: Nest = {
      id: nanoid(),
      memberIds: [userId, friendUserId],
      createdAt: now,
      status: 'incubating',
      egg: { contributions: {}, warmthLog: [], createdAt: now },
      lastSeenAt: { [userId]: now, [friendUserId]: now },
    }
    this.data.nests.push(nest)
    this.persist()
    return nest
  }

  async warmEgg(nestId: string, userId: string, now: string): Promise<Nest> {
    const nest = this.mustGetRawNest(nestId)
    this.assertMember(nest, userId)
    if (nest.status !== 'incubating' || !nest.egg) throw new Error('Este nido no tiene un huevo esperando calor.')
    if (!canWarmEggToday(nest.egg, userId, now)) {
      throw new Error('Hoy ya le has dado todo el calor que puedes. Vuelve mañana.')
    }

    nest.egg = addEggContribution(nest.egg, userId, EGG_CONFIG.pointsPerWarmthAction)
    nest.egg.warmthLog.push({ userId, createdAt: now })
    nest.lastSeenAt[userId] = now

    if (isEggReadyToHatch(nest.egg, nest.memberIds)) {
      const speciesId = resolveHatchSpecies()
      nest.pet = {
        speciesId,
        name: '',
        stage: 'baby',
        bornAt: now,
        stageEnteredAt: now,
        affectionPoints: 0,
        needs: fullNeeds(),
        needsUpdatedAt: now,
        careLog: [],
      }
      nest.status = 'active'
      delete nest.egg
    }

    this.persist()
    return projectNest(nest, now)
  }

  async careAction(nestId: string, userId: string, action: Exclude<CareAction, 'warm'>, now: string): Promise<Nest> {
    const nest = this.mustGetRawNest(nestId)
    this.assertMember(nest, userId)
    if (nest.status !== 'active' || !nest.pet) throw new Error('Aún no hay ninguna mascota que cuidar en este nido.')

    const decayed = decayNeeds(nest.pet.needs, nest.pet.needsUpdatedAt, now)
    nest.pet.needs = applyCareAction(decayed, action)
    nest.pet.needsUpdatedAt = now
    nest.pet.affectionPoints += AFFECTION_PER_ACTION[action]
    nest.pet.careLog = [{ id: nanoid(), userId, action, createdAt: now }, ...nest.pet.careLog].slice(0, 30)

    const newStage = computeGrowthStage(nest.pet.bornAt, now, nest.pet.affectionPoints)
    if (newStage !== nest.pet.stage) {
      nest.pet.stage = newStage
      nest.pet.stageEnteredAt = now
    }
    nest.lastSeenAt[userId] = now

    this.persist()
    return projectNest(nest, now)
  }

  async petName(nestId: string, name: string): Promise<Nest> {
    const nest = this.mustGetRawNest(nestId)
    if (!nest.pet) throw new Error('Todavía no hay mascota que nombrar.')
    nest.pet.name = name.slice(0, 20)
    this.persist()
    return projectNest(nest, new Date().toISOString())
  }

  /** Solo para desarrollo/demo: adelanta el reloj Y añade cariño acumulado, para poder ver una evolución sin repetir decenas de acciones de cuidado. */
  async devAdvanceTime(nestId: string, hours: number): Promise<Nest> {
    const nest = this.mustGetRawNest(nestId)
    const shiftMs = hours * 3_600_000
    if (nest.pet) {
      nest.pet.bornAt = new Date(new Date(nest.pet.bornAt).getTime() - shiftMs).toISOString()
      nest.pet.needsUpdatedAt = new Date(new Date(nest.pet.needsUpdatedAt).getTime() - shiftMs).toISOString()
      nest.pet.affectionPoints += Math.round(hours * 3)
    }
    this.persist()
    return projectNest(nest, new Date().toISOString())
  }

  // -- Rachas / economía ----------------------------------------------------

  async markVisit(userId: string, now: string): Promise<StreakState> {
    const current = this.data.streaks[userId] ?? EMPTY_STREAK
    const updated = updateStreakOnVisit(current, now.slice(0, 10))
    this.data.streaks[userId] = updated
    this.persist()
    return updated
  }

  async getStreak(userId: string): Promise<StreakState> {
    return this.data.streaks[userId] ?? EMPTY_STREAK
  }

  async getCurrency(userId: string): Promise<number> {
    return this.data.currency[userId] ?? 0
  }

  async addCurrency(userId: string, amount: number): Promise<number> {
    const next = Math.max(0, (this.data.currency[userId] ?? 0) + amount)
    this.data.currency[userId] = next
    this.persist()
    return next
  }

  // -- utils ---------------------------------------------------------------

  private mustGetRawNest(nestId: string): Nest {
    const nest = this.data.nests.find((n) => n.id === nestId)
    if (!nest) throw new Error('Ese nido no existe.')
    return nest
  }

  /** Equivalente en el cliente a lo que impondría RLS en Supabase: nadie actúa sobre un nido del que no es miembro. */
  private assertMember(nest: Nest, userId: string) {
    if (!nest.memberIds.includes(userId)) {
      throw new Error('No tienes acceso a este nido.')
    }
  }
}


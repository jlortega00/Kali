/**
 * Lógica de juego pura y determinista (sin I/O, sin `Date.now()` implícito:
 * todo recibe el "ahora" como parámetro). Esto es lo que correría en un
 * servidor real (Edge Function) y en el modo demo local por igual — el
 * estado siempre se deriva de marcas de tiempo, nunca de un temporizador
 * corriendo en segundo plano.
 */
import {
  EGG_CONFIG,
  GROWTH_REQUIREMENTS,
  GROWTH_STAGES,
  HATCH_RARITY_WEIGHTS,
  NEED_DECAY_PER_HOUR,
  NEED_FLOOR,
  NEED_IDS,
  SPECIES_LIST,
  STREAK_CONFIG,
  type GrowthStage,
  type Rarity,
  type SpeciesId,
} from '@/config/gameConfig'
import type { CareAction as CareActionType, EggState, NeedsRecord, StreakState } from './types'

const HOUR_MS = 3_600_000
const DAY_MS = 24 * HOUR_MS

// ---------------------------------------------------------------------------
// Necesidades
// ---------------------------------------------------------------------------

export function fullNeeds(): NeedsRecord {
  return Object.fromEntries(NEED_IDS.map((id) => [id, 100])) as NeedsRecord
}

/** Aplica el desgaste transcurrido entre `since` y `now` a un set de necesidades. */
export function decayNeeds(needs: NeedsRecord, since: string, now: string): NeedsRecord {
  const hours = Math.max(0, (new Date(now).getTime() - new Date(since).getTime()) / HOUR_MS)
  const result = {} as NeedsRecord
  for (const id of NEED_IDS) {
    const decayed = needs[id] - NEED_DECAY_PER_HOUR[id] * hours
    result[id] = Math.max(NEED_FLOOR, Math.min(100, decayed))
  }
  return result
}

const CARE_ACTION_EFFECTS: Record<Exclude<CareActionType, 'warm'>, Partial<NeedsRecord>> = {
  feed: { hunger: 35 },
  clean: { hygiene: 40 },
  pet: { affection: 30 },
  play: { fun: 30, energy: -8 },
}

/** Devuelve las necesidades tras aplicar una acción de cuidado (feed/clean/pet/play). */
export function applyCareAction(needs: NeedsRecord, action: Exclude<CareActionType, 'warm'>): NeedsRecord {
  const deltas = CARE_ACTION_EFFECTS[action]
  const result = { ...needs }
  for (const id of NEED_IDS) {
    const delta = deltas[id] ?? 0
    result[id] = Math.max(NEED_FLOOR, Math.min(100, result[id] + delta))
  }
  return result
}

/** Puntos de cariño que otorga cada acción de cuidado (alimentan el crecimiento). */
export const AFFECTION_PER_ACTION: Record<Exclude<CareActionType, 'warm'>, number> = {
  feed: 4,
  clean: 3,
  pet: 6,
  play: 5,
}

// ---------------------------------------------------------------------------
// Crecimiento
// ---------------------------------------------------------------------------

/** Etapa de crecimiento que le corresponde a la mascota dado su tiempo de vida y cariño acumulado. Nunca retrocede ni salta etapas. */
export function computeGrowthStage(bornAt: string, now: string, affectionPoints: number): GrowthStage {
  const daysAlive = (new Date(now).getTime() - new Date(bornAt).getTime()) / DAY_MS
  let resolved: GrowthStage = 'baby'
  for (const stage of GROWTH_STAGES) {
    const req = GROWTH_REQUIREMENTS[stage]
    if (daysAlive >= req.minDays && affectionPoints >= req.minAffectionPoints) {
      resolved = stage
    }
  }
  return resolved
}

// ---------------------------------------------------------------------------
// Huevo / eclosión
// ---------------------------------------------------------------------------

export function addEggContribution(egg: EggState, userId: string, points: number): EggState {
  return {
    ...egg,
    contributions: {
      ...egg.contributions,
      [userId]: (egg.contributions[userId] ?? 0) + points,
    },
  }
}

export function eggTotalPoints(egg: EggState): number {
  return Object.values(egg.contributions).reduce((sum, v) => sum + v, 0)
}

/** El huevo eclosiona cuando llega al objetivo Y ambos miembros aportaron al menos la cuota mínima. */
export function isEggReadyToHatch(egg: EggState, memberIds: [string, string]): boolean {
  const total = eggTotalPoints(egg)
  if (total < EGG_CONFIG.hatchPointsTarget) return false
  return memberIds.every((id) => (egg.contributions[id] ?? 0) / total >= EGG_CONFIG.minContributionShare)
}

function sameCalendarDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10)
}

export function warmthActionsToday(egg: EggState, userId: string, now: string): number {
  return egg.warmthLog.filter((entry) => entry.userId === userId && sameCalendarDay(entry.createdAt, now)).length
}

export function canWarmEggToday(egg: EggState, userId: string, now: string): boolean {
  return warmthActionsToday(egg, userId, now) < EGG_CONFIG.maxWarmthActionsPerDay
}

export function crackStageForEgg(egg: EggState): number {
  const ratio = eggTotalPoints(egg) / EGG_CONFIG.hatchPointsTarget
  return Math.min(EGG_CONFIG.crackStages, Math.floor(ratio * EGG_CONFIG.crackStages))
}

export function eggProgressRatio(egg: EggState): number {
  return Math.min(1, eggTotalPoints(egg) / EGG_CONFIG.hatchPointsTarget)
}

export type RandomFn = () => number

/** Elige una especie al azar respetando los pesos de rareza (70/25/5 por defecto, repartidos a partes iguales dentro de cada rareza). */
export function resolveHatchSpecies(random: RandomFn = Math.random): SpeciesId {
  const byRarity = new Map<Rarity, SpeciesId[]>()
  for (const species of SPECIES_LIST) {
    const list = byRarity.get(species.rarity) ?? []
    list.push(species.id)
    byRarity.set(species.rarity, list)
  }

  const roll = random()
  let acc = 0
  const rarities = Object.keys(HATCH_RARITY_WEIGHTS) as Rarity[]
  for (const rarity of rarities) {
    acc += HATCH_RARITY_WEIGHTS[rarity]
    if (roll <= acc) {
      const options = byRarity.get(rarity) ?? []
      const pick = Math.floor(random() * options.length)
      return options[Math.min(pick, options.length - 1)]
    }
  }
  // Fallback numérico por si acc no llega a 1 por redondeo.
  const fallback = byRarity.get('common')![0]
  return fallback
}

// ---------------------------------------------------------------------------
// Rachas diarias
// ---------------------------------------------------------------------------

function startOfWeek(dateISO: string): string {
  const d = new Date(dateISO)
  const day = d.getUTCDay()
  const diff = (day + 6) % 7 // lunes = 0
  d.setUTCDate(d.getUTCDate() - diff)
  return d.toISOString().slice(0, 10)
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / DAY_MS)
}

/** Actualiza la racha al registrar una visita en `todayISO` (fecha, sin hora). Usa el día de gracia semanal si se salta un día. */
export function updateStreakOnVisit(streak: StreakState, todayISO: string): StreakState {
  if (streak.lastVisitDate === todayISO) return streak

  const week = startOfWeek(todayISO)
  const graceAvailable = STREAK_CONFIG.graceDaysPerWeek > 0 && (streak.weekStartDate !== week || !streak.graceUsedThisWeek)

  if (!streak.lastVisitDate) {
    return { count: 1, lastVisitDate: todayISO, graceUsedThisWeek: false, weekStartDate: week }
  }

  const gap = daysBetween(streak.lastVisitDate, todayISO)

  if (gap === 1) {
    return {
      count: streak.count + 1,
      lastVisitDate: todayISO,
      graceUsedThisWeek: streak.weekStartDate === week ? streak.graceUsedThisWeek : false,
      weekStartDate: week,
    }
  }

  if (gap === 2 && graceAvailable) {
    return { count: streak.count + 1, lastVisitDate: todayISO, graceUsedThisWeek: true, weekStartDate: week }
  }

  return { count: 1, lastVisitDate: todayISO, graceUsedThisWeek: false, weekStartDate: week }
}

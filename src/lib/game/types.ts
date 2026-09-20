import type { GrowthStage, NeedId, SpeciesId } from '@/config/gameConfig'

export interface User {
  id: string
  username: string
  avatarSeed: string
  friendCode: string
  createdAt: string
  birthYearConsent: boolean
}

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked'

export interface Friendship {
  id: string
  userIds: [string, string]
  requestedBy: string
  status: FriendshipStatus
  createdAt: string
}

export type CareAction = 'feed' | 'clean' | 'pet' | 'play' | 'warm'

export interface CareLogEntry {
  id: string
  userId: string
  action: Exclude<CareAction, 'warm'>
  createdAt: string
}

export interface EggState {
  /** Puntos de "calor" aportados por cada miembro del nido. */
  contributions: Record<string, number>
  /** Registro de acciones de calor, para limitar cuántas puede hacer cada uno al día. */
  warmthLog: { userId: string; createdAt: string }[]
  createdAt: string
}

export type NeedsRecord = Record<NeedId, number>

export interface PetState {
  speciesId: SpeciesId
  name: string
  stage: GrowthStage
  bornAt: string
  stageEnteredAt: string
  affectionPoints: number
  needs: NeedsRecord
  needsUpdatedAt: string
  careLog: CareLogEntry[]
}

export type NestStatus = 'incubating' | 'active' | 'memorial'

export interface Nest {
  id: string
  memberIds: [string, string]
  createdAt: string
  status: NestStatus
  egg?: EggState
  pet?: PetState
  /** Última vez que cada miembro visitó el nido (para inactividad de 14 días). */
  lastSeenAt: Record<string, string>
}

export interface StreakState {
  count: number
  lastVisitDate: string | null
  graceUsedThisWeek: boolean
  weekStartDate: string | null
}

export interface DailyTaskState {
  id: string
  date: string
  completed: boolean
}

export interface CurrencyState {
  balance: number
}

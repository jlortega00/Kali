/**
 * gameConfig.ts
 *
 * Único archivo con todos los valores de balance del juego (tiempos, costes,
 * probabilidades, límites). Nada de esto debe hardcodearse en otras partes
 * del código: si hay que ajustar el juego, se ajusta aquí.
 */

// ---------------------------------------------------------------------------
// Identidad del proyecto
// ---------------------------------------------------------------------------

export const APP_NAME = 'Nidito'
export const APP_TAGLINE = 'Cuidad juntos a vuestra mascota'

// ---------------------------------------------------------------------------
// Especies
// ---------------------------------------------------------------------------

export type Rarity = 'common' | 'rare' | 'legendary'

export type SpeciesId =
  | 'gatito-mochi'
  | 'conejo-nube'
  | 'pollito-pipo'
  | 'osito-miel'
  | 'zorrito-kiko'
  | 'panda-bao'
  | 'axolotl-bubi'
  | 'erizo-hoja'
  | 'pinguino-copo'
  | 'dragoncito-chispa'

export interface SpeciesMeta {
  id: SpeciesId
  name: string
  rarity: Rarity
}

/** Las 10 especies del juego, en el orden en que deben mostrarse. */
export const SPECIES_LIST: SpeciesMeta[] = [
  { id: 'gatito-mochi', name: 'Gatito Mochi', rarity: 'common' },
  { id: 'conejo-nube', name: 'Conejo Nube', rarity: 'common' },
  { id: 'pollito-pipo', name: 'Pollito Pipo', rarity: 'common' },
  { id: 'osito-miel', name: 'Osito Miel', rarity: 'common' },
  { id: 'zorrito-kiko', name: 'Zorrito Kiko', rarity: 'common' },
  { id: 'panda-bao', name: 'Panda Bao', rarity: 'common' },
  { id: 'axolotl-bubi', name: 'Axolotl Bubi', rarity: 'rare' },
  { id: 'erizo-hoja', name: 'Erizo Hoja', rarity: 'rare' },
  { id: 'pinguino-copo', name: 'Pingüino Copo', rarity: 'rare' },
  { id: 'dragoncito-chispa', name: 'Dragoncito Chispa', rarity: 'legendary' },
]

/**
 * Probabilidad total de cada rareza al eclosionar. Dentro de una rareza, la
 * probabilidad se reparte a partes iguales entre sus especies.
 */
export const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Común',
  rare: 'Raro',
  legendary: 'Legendario',
}

export const HATCH_RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 0.7,
  rare: 0.25,
  legendary: 0.05,
}

// ---------------------------------------------------------------------------
// Etapas de crecimiento
// ---------------------------------------------------------------------------

export type GrowthStage = 'baby' | 'child' | 'teen' | 'adult'

export const GROWTH_STAGES: GrowthStage[] = ['baby', 'child', 'teen', 'adult']

export const GROWTH_STAGE_LABELS: Record<GrowthStage, string> = {
  baby: 'Bebé',
  child: 'Niño',
  teen: 'Adolescente',
  adult: 'Adulto',
}

/** Días mínimos de vida y puntos de cariño acumulados (entre los dos) para pasar a la siguiente etapa. */
export const GROWTH_REQUIREMENTS: Record<GrowthStage, { minDays: number; minAffectionPoints: number }> = {
  baby: { minDays: 0, minAffectionPoints: 0 },
  child: { minDays: 2, minAffectionPoints: 150 },
  teen: { minDays: 5, minAffectionPoints: 400 },
  adult: { minDays: 9, minAffectionPoints: 800 },
}

// ---------------------------------------------------------------------------
// Expresiones y animaciones
// ---------------------------------------------------------------------------

export type Expression =
  | 'happy'
  | 'neutral'
  | 'hungry'
  | 'sleepy'
  | 'sad'
  | 'eating'
  | 'loved'
  | 'playing'
  | 'celebrating'

export const EXPRESSIONS: Expression[] = [
  'happy',
  'neutral',
  'hungry',
  'sleepy',
  'sad',
  'eating',
  'loved',
  'playing',
  'celebrating',
]

export const ANIMATION_TIMING = {
  /** Duración de un ciclo de respiración (subir/bajar), en segundos. */
  breathingSeconds: 3.2,
  /** Cada cuántos segundos parpadea de media la mascota. */
  blinkIntervalSeconds: 4,
  /** Duración del parpadeo, en segundos. */
  blinkDurationSeconds: 0.15,
  /** Duración del rebote al tocar la mascota, en segundos. */
  tapBounceSeconds: 0.45,
  /** Cuántos corazoncitos aparecen al acariciar. */
  petHeartsCount: 3,
}

// ---------------------------------------------------------------------------
// Huevo e incubación cooperativa
// ---------------------------------------------------------------------------

export const EGG_CONFIG = {
  /** Puntos necesarios para que el huevo eclosione. */
  hatchPointsTarget: 100,
  /** Aportación mínima (fracción del total) que debe hacer cada miembro del nido. */
  minContributionShare: 0.3,
  /** Puntos de "calor" que da cada acción de incubar. */
  pointsPerWarmthAction: 4,
  /** Máximo de acciones de incubar por persona y día. */
  maxWarmthActionsPerDay: 6,
  /** Rango objetivo de duración de la incubación, en horas de juego real. */
  targetHoursMin: 24,
  targetHoursMax: 48,
  /** Número de grietas visibles a medida que se acerca la eclosión (etapas del huevo). */
  crackStages: 4,
}

// ---------------------------------------------------------------------------
// Nidos y amistades
// ---------------------------------------------------------------------------

export const FRIENDSHIP_CONFIG = {
  maxActiveNests: 3,
  friendCodeLength: 6,
  /** Días de inactividad de un miembro antes de permitir que el otro cuide en solitario. */
  inactivityThresholdDays: 14,
}

// ---------------------------------------------------------------------------
// Necesidades de la mascota (barras 0-100)
// ---------------------------------------------------------------------------

export type NeedId = 'hunger' | 'fun' | 'hygiene' | 'energy' | 'affection'

export const NEED_IDS: NeedId[] = ['hunger', 'fun', 'hygiene', 'energy', 'affection']

/**
 * Puntos que pierde cada necesidad por hora. Calibrado para que, con dos
 * visitas diarias de ~15 minutos, la mascota se mantenga contenta.
 */
export const NEED_DECAY_PER_HOUR: Record<NeedId, number> = {
  hunger: 2.5,
  fun: 2,
  hygiene: 1.5,
  energy: 1.8,
  affection: 1.6,
}

/** Por debajo de este valor la necesidad se considera "baja" (afecta al estado de ánimo). */
export const NEED_LOW_THRESHOLD = 30

/** La mascota nunca desaparece: este es el suelo mínimo de cada necesidad. */
export const NEED_FLOOR = 5

// ---------------------------------------------------------------------------
// Economía (moneda blanda)
// ---------------------------------------------------------------------------

export const ECONOMY_CONFIG = {
  currencyName: 'Semillitas',
  dailyTaskReward: 15,
  minigameBaseReward: 10,
  streakMilestoneRewards: [7, 14, 30, 60, 100],
}

// ---------------------------------------------------------------------------
// Rachas y recompensas
// ---------------------------------------------------------------------------

export const STREAK_CONFIG = {
  graceDaysPerWeek: 1,
  dailyTasksCount: 3,
  morningWindow: { startHour: 6, endHour: 12 },
  eveningWindow: { startHour: 18, endHour: 23 },
}

export const NOTIFICATIONS_CONFIG = {
  maxPerDay: 2,
  defaultQuietHours: { startHour: 22, endHour: 8 },
}

// ---------------------------------------------------------------------------
// Feature flags (ganchos de retención activables/desactivables)
// ---------------------------------------------------------------------------

export const FEATURE_FLAGS = {
  dailyStreak: true,
  dailyChest: true,
  dailyTasks: true,
  morningEveningRoutines: true,
  pushNotifications: true,
  speciesAlbum: true,
  customization: true,
  giftsBetweenPlayers: true,
  seasonalEvents: true,
  shareableCard: true,
  achievements: true,
  photoMode: true,
  /** Tienda cosmética con dinero real: preparada en la UI pero apagada en esta versión. */
  cosmeticShop: false,
}

// ---------------------------------------------------------------------------
// Minijuegos
// ---------------------------------------------------------------------------

export type MinigameId =
  | 'catch-food'
  | 'memory-pairs'
  | 'rhythm-jump'
  | 'star-fishing'
  | 'async-record'
  | 'scratch-card'

export const MINIGAMES: { id: MinigameId; name: string; durationSeconds: number }[] = [
  { id: 'catch-food', name: 'Atrapa la comida', durationSeconds: 60 },
  { id: 'memory-pairs', name: 'Memoria de parejas', durationSeconds: 90 },
  { id: 'rhythm-jump', name: 'Salto ritmado', durationSeconds: 60 },
  { id: 'star-fishing', name: 'Pesca de estrellitas', durationSeconds: 75 },
  { id: 'async-record', name: 'Récord a batir', durationSeconds: 60 },
  { id: 'scratch-card', name: 'Rasca y descubre', durationSeconds: 15 },
]

// ---------------------------------------------------------------------------
// Edad mínima (RGPD / consentimiento)
// ---------------------------------------------------------------------------

export const MIN_AGE_YEARS = 14

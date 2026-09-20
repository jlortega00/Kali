import type { CareAction, Friendship, Nest, StreakState, User } from '@/lib/game/types'

/**
 * Todo lo que la UI necesita del backend, sin saber si detrás hay Supabase
 * o el modo demo (localStorage). Cualquier pantalla se escribe contra esta
 * interfaz; cambiar de backend es cambiar qué implementación se instancia
 * en `src/lib/db/index.ts`.
 */
export interface GameRepository {
  readonly kind: 'demo' | 'supabase'

  getCurrentUser(): Promise<User | null>
  signOut(): Promise<void>

  getUser(userId: string): Promise<User | null>
  findUserByFriendCode(code: string): Promise<User | null>

  listFriendships(userId: string): Promise<Friendship[]>
  sendFriendRequest(fromUserId: string, friendCode: string): Promise<Friendship>
  respondFriendRequest(friendshipId: string, userId: string, accept: boolean): Promise<Friendship>
  removeFriendship(friendshipId: string, userId: string): Promise<void>

  listMyNests(userId: string): Promise<Nest[]>
  /** Devuelve `null` si el nido no existe o si `requesterId` no es miembro (igual que haría RLS en Supabase: fila invisible, no un error). */
  getNest(nestId: string, requesterId: string): Promise<Nest | null>
  createNest(userId: string, friendUserId: string): Promise<Nest>

  /** Una acción corta de "calor" durante la incubación. Resuelve la eclosión si se alcanza el objetivo. */
  warmEgg(nestId: string, userId: string, now: string): Promise<Nest>

  careAction(nestId: string, userId: string, action: Exclude<CareAction, 'warm'>, now: string): Promise<Nest>

  petName(nestId: string, name: string): Promise<Nest>

  markVisit(userId: string, now: string): Promise<StreakState>
  getStreak(userId: string): Promise<StreakState>

  getCurrency(userId: string): Promise<number>
  addCurrency(userId: string, amount: number): Promise<number>

  /** Solo disponible (o solo con efecto real) en modo demo: adelanta el reloj de un nido para ver evoluciones sin esperar días. */
  devAdvanceTime(nestId: string, hours: number): Promise<Nest>
}

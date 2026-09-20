import { DemoRepository } from './demoRepository'
import type { GameRepository } from './repository'
import { isSupabaseConfigured, supabase } from './supabaseClient'
import { SupabaseRepository } from './supabaseRepository'

/**
 * Único punto donde se decide qué backend usa la app: si hay credenciales
 * de Supabase en `.env` se usa el backend real, si no, el modo demo local
 * (dos usuarios simulados, ver demoRepository.ts). El resto del código
 * nunca importa `DemoRepository` ni `SupabaseRepository` directamente.
 */
export const repo: GameRepository =
  isSupabaseConfigured && supabase ? new SupabaseRepository(supabase) : new DemoRepository()

export const isDemoMode = repo.kind === 'demo'

export type { GameRepository } from './repository'

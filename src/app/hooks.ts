import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { repo } from '@/lib/db/index'
import type { CareAction } from '@/lib/game/types'
import { useSession } from './SessionContext'

export function useMyNests() {
  const { user } = useSession()
  return useQuery({
    queryKey: ['nests', user?.id],
    queryFn: () => repo.listMyNests(user!.id),
    enabled: Boolean(user),
    refetchInterval: 5000,
  })
}

export function useNest(nestId: string | undefined) {
  const { user } = useSession()
  return useQuery({
    queryKey: ['nest', nestId, user?.id],
    queryFn: () => repo.getNest(nestId!, user!.id),
    enabled: Boolean(nestId && user),
    refetchInterval: 4000,
  })
}

export function useWarmEgg(nestId: string) {
  const { user } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => repo.warmEgg(nestId, user!.id, new Date().toISOString()),
    onSuccess: (nest) => {
      queryClient.setQueryData(['nest', nestId, user?.id], nest)
      queryClient.invalidateQueries({ queryKey: ['nests'] })
    },
  })
}

export function useCareAction(nestId: string) {
  const { user } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (action: Exclude<CareAction, 'warm'>) => repo.careAction(nestId, user!.id, action, new Date().toISOString()),
    onSuccess: (nest) => {
      queryClient.setQueryData(['nest', nestId, user?.id], nest)
      queryClient.invalidateQueries({ queryKey: ['nests'] })
    },
  })
}

export function useDevAdvanceTime(nestId: string) {
  const { user } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (hours: number) => repo.devAdvanceTime(nestId, hours),
    onSuccess: (nest) => {
      queryClient.setQueryData(['nest', nestId, user?.id], nest)
    },
  })
}

/** Resuelve nombres de usuario para una lista de ids (p. ej. los miembros de un nido). */
export function useUserNames(userIds: string[]) {
  const key = [...userIds].sort().join(',')
  return useQuery({
    queryKey: ['userNames', key],
    queryFn: async () => {
      const entries = await Promise.all(userIds.map(async (id) => [id, await repo.getUser(id)] as const))
      return Object.fromEntries(entries)
    },
    enabled: userIds.length > 0,
  })
}

export function useFriendships() {
  const { user } = useSession()
  return useQuery({
    queryKey: ['friendships', user?.id],
    queryFn: () => repo.listFriendships(user!.id),
    enabled: Boolean(user),
    refetchInterval: 6000,
  })
}

/**
 * La propia consulta registra la visita de hoy (marca la racha) y devuelve
 * el resultado ya actualizado — así la UI nunca muestra un valor viejo
 * mientras espera una invalidación por separado.
 */
export function useStreak() {
  const { user } = useSession()
  return useQuery({
    queryKey: ['streak', user?.id],
    queryFn: () => repo.markVisit(user!.id, new Date().toISOString()),
    enabled: Boolean(user),
    staleTime: 60_000,
  })
}

export function useAwardCurrency() {
  const { user } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (amount: number) => repo.addCurrency(user!.id, amount),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['currency'] }),
  })
}

export function useCurrency() {
  const { user } = useSession()
  return useQuery({
    queryKey: ['currency', user?.id],
    queryFn: () => repo.getCurrency(user!.id),
    enabled: Boolean(user),
  })
}

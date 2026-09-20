import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, type ReactNode } from 'react'
import { DemoRepository } from '@/lib/db/demoRepository'
import { isDemoMode, repo } from '@/lib/db/index'
import type { User } from '@/lib/game/types'

interface SessionValue {
  user: User | null
  isLoading: boolean
  isDemoMode: boolean
  demoUsers: User[]
  switchDemoUser: (userId: string) => void
  signOut: () => Promise<void>
}

const SessionCtx = createContext<SessionValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => repo.getCurrentUser(),
  })

  const demoUsers = isDemoMode ? (repo as DemoRepository).listDemoUsers() : []

  const switchDemoUser = (userId: string) => {
    if (!isDemoMode) return
    ;(repo as DemoRepository).switchDemoUser(userId)
    queryClient.invalidateQueries()
  }

  const signOut = async () => {
    await repo.signOut()
    queryClient.invalidateQueries()
  }

  return (
    <SessionCtx.Provider value={{ user: user ?? null, isLoading, isDemoMode, demoUsers, switchDemoUser, signOut }}>
      {children}
    </SessionCtx.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionCtx)
  if (!ctx) throw new Error('useSession debe usarse dentro de <SessionProvider>')
  return ctx
}

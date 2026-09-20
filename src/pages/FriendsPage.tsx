import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useFriendships, useMyNests } from '@/app/hooks'
import { useSession } from '@/app/SessionContext'
import { FRIENDSHIP_CONFIG } from '@/config/gameConfig'
import { repo } from '@/lib/db/index'
import type { User } from '@/lib/game/types'

export default function FriendsPage() {
  const { user } = useSession()
  const friendships = useFriendships()
  const nests = useMyNests()
  const queryClient = useQueryClient()

  const [code, setCode] = useState('')
  const [sendError, setSendError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [friendNames, setFriendNames] = useState<Record<string, User>>({})

  useEffect(() => {
    if (!user || !friendships.data) return
    const missing = friendships.data
      .map((f) => f.userIds.find((id) => id !== user.id)!)
      .filter((id) => !friendNames[id])
    if (missing.length === 0) return
    Promise.all(missing.map((id) => repo.getUser(id))).then((users) => {
      setFriendNames((prev) => {
        const next = { ...prev }
        for (const u of users) if (u) next[u.id] = u
        return next
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendships.data, user])

  if (!user) return null

  const inviteLink = `${window.location.origin}/invite/${user.friendCode}`

  const handleSendRequest = async () => {
    setSendError(null)
    setSending(true)
    try {
      await repo.sendFriendRequest(user.id, code.trim())
      setCode('')
      queryClient.invalidateQueries({ queryKey: ['friendships'] })
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'No se pudo enviar la solicitud.')
    } finally {
      setSending(false)
    }
  }

  const respond = async (friendshipId: string, accept: boolean) => {
    await repo.respondFriendRequest(friendshipId, user.id, accept)
    queryClient.invalidateQueries({ queryKey: ['friendships'] })
  }

  const openNest = async (friendId: string) => {
    setSendError(null)
    try {
      await repo.createNest(user.id, friendId)
      queryClient.invalidateQueries({ queryKey: ['nests'] })
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'No se pudo abrir el nido.')
    }
  }

  const pending = friendships.data?.filter((f) => f.status === 'pending') ?? []
  const accepted = friendships.data?.filter((f) => f.status === 'accepted') ?? []
  const activeNestFriendIds = new Set(
    (nests.data ?? []).flatMap((n) => n.memberIds).filter((id) => id !== user.id),
  )

  return (
    <div className="space-y-6 px-4 py-4">
      <section className="rounded-blob bg-white/70 p-4 shadow-sm">
        <h2 className="text-sm font-bold text-ink">Tu código de amigo</h2>
        <p className="mt-1 text-2xl font-black tracking-widest text-blush-dark">{user.friendCode}</p>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(inviteLink)}
          className="mt-2 rounded-full bg-sky/60 px-3 py-1 text-xs font-semibold text-ink"
        >
          Copiar enlace de invitación 🔗
        </button>
      </section>

      <section className="rounded-blob bg-white/70 p-4 shadow-sm">
        <h2 className="text-sm font-bold text-ink">Añadir a alguien</h2>
        <div className="mt-2 flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Código de 6 caracteres"
            maxLength={6}
            className="flex-1 rounded-full border border-ink/15 bg-white px-3 py-2 text-sm uppercase tracking-widest"
          />
          <button
            type="button"
            disabled={sending || code.trim().length < 4}
            onClick={handleSendRequest}
            className="rounded-full bg-blush-dark px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
          >
            Enviar
          </button>
        </div>
        {sendError && <p className="mt-2 text-xs font-semibold text-red-500">{sendError}</p>}
      </section>

      {pending.length > 0 && (
        <section className="rounded-blob bg-white/70 p-4 shadow-sm">
          <h2 className="text-sm font-bold text-ink">Solicitudes</h2>
          <ul className="mt-2 space-y-2">
            {pending.map((f) => {
              const otherId = f.userIds.find((id) => id !== user.id)!
              const isIncoming = f.requestedBy !== user.id
              return (
                <li key={f.id} className="flex items-center justify-between text-sm">
                  <span>{friendNames[otherId]?.username ?? otherId}</span>
                  {isIncoming ? (
                    <span className="flex gap-1">
                      <button type="button" onClick={() => respond(f.id, true)} className="rounded-full bg-mint px-2.5 py-1 text-xs font-bold">
                        Aceptar
                      </button>
                      <button type="button" onClick={() => respond(f.id, false)} className="rounded-full bg-black/10 px-2.5 py-1 text-xs font-bold">
                        Rechazar
                      </button>
                    </span>
                  ) : (
                    <span className="text-xs text-ink-soft">Pendiente…</span>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section className="rounded-blob bg-white/70 p-4 shadow-sm">
        <h2 className="text-sm font-bold text-ink">Tus amigos</h2>
        {accepted.length === 0 && <p className="mt-2 text-xs text-ink-soft">Aún no tienes amigos añadidos.</p>}
        <ul className="mt-2 space-y-2">
          {accepted.map((f) => {
            const otherId = f.userIds.find((id) => id !== user.id)!
            const hasNest = activeNestFriendIds.has(otherId)
            return (
              <li key={f.id} className="flex items-center justify-between text-sm">
                <span>{friendNames[otherId]?.username ?? otherId}</span>
                {hasNest ? (
                  <span className="text-xs text-ink-soft">Ya tenéis un nido 🪺</span>
                ) : (
                  <button type="button" onClick={() => openNest(otherId)} className="rounded-full bg-blush-dark px-3 py-1 text-xs font-bold text-white">
                    Abrir nido 🥚
                  </button>
                )}
              </li>
            )
          })}
        </ul>
        <p className="mt-3 text-[11px] text-ink-soft">Máximo {FRIENDSHIP_CONFIG.maxActiveNests} nidos activos a la vez.</p>
      </section>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFriendships } from '@/app/hooks'
import { useSession } from '@/app/SessionContext'
import { APP_NAME, APP_TAGLINE, MIN_AGE_YEARS } from '@/config/gameConfig'

const ONBOARDED_KEY = 'nidito:onboarded'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user, isDemoMode, demoUsers, switchDemoUser } = useSession()
  const friendships = useFriendships()
  const [ageConfirmed, setAgeConfirmed] = useState(true)
  const [step, setStep] = useState(0)

  if (!user) return null

  const hasFriend = (friendships.data ?? []).some((f) => f.status === 'accepted')

  const finish = () => {
    try {
      window.localStorage.setItem(ONBOARDED_KEY, '1')
    } catch {
      // sin almacenamiento persistente, seguirá viendo el onboarding: no es grave
    }
    navigate('/home', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-8 text-center">
      <div>
        <p className="text-5xl">🥚</p>
        <h1 className="mt-2 text-2xl font-black text-ink">{APP_NAME}</h1>
        <p className="text-sm text-ink-soft">{APP_TAGLINE}</p>
      </div>

      {step === 0 && (
        <div className="w-full max-w-xs space-y-4">
          <p className="text-sm text-ink">
            Hola, <strong>{user.username}</strong> 👋
          </p>
          {isDemoMode && (
            <div className="rounded-blob bg-white/70 p-3 text-xs text-ink-soft">
              <p className="font-semibold text-ink">Modo demo</p>
              <p className="mt-1">Puedes probar el flujo completo tú solo/a alternando entre los dos usuarios simulados.</p>
              <div className="mt-2 flex justify-center gap-2">
                {demoUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => switchDemoUser(u.id)}
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${u.id === user.id ? 'bg-ink text-white' : 'bg-black/10 text-ink'}`}
                  >
                    {u.username}
                  </button>
                ))}
              </div>
            </div>
          )}
          <label className="flex items-start gap-2 text-left text-xs text-ink-soft">
            <input type="checkbox" checked={ageConfirmed} onChange={(e) => setAgeConfirmed(e.target.checked)} className="mt-0.5" />
            Confirmo que tengo {MIN_AGE_YEARS} años o más.
          </label>
          <button
            type="button"
            disabled={!ageConfirmed}
            onClick={() => setStep(1)}
            className="w-full rounded-full bg-blush-dark px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40"
          >
            Continuar
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="w-full max-w-xs space-y-4">
          <p className="text-sm text-ink">
            {hasFriend ? 'Ya tienes a alguien conectado 🎉' : 'Añade a tu pareja o mejor amigo/a con su código'}
          </p>
          <p className="rounded-blob bg-white/70 p-3 text-xs text-ink-soft">
            Tu código de amigo es <strong className="tracking-widest text-ink">{user.friendCode}</strong>. Compártelo, o pídele el suyo, desde la
            pestaña Amigos.
          </p>
          <button type="button" onClick={finish} className="w-full rounded-full bg-blush-dark px-5 py-2.5 text-sm font-bold text-white">
            Ver nuestro huevo 🥚
          </button>
        </div>
      )}
    </div>
  )
}

export function hasCompletedOnboarding(): boolean {
  try {
    return window.localStorage.getItem(ONBOARDED_KEY) === '1'
  } catch {
    return false
  }
}

import { useTranslation } from 'react-i18next'
import { NavLink, Outlet } from 'react-router-dom'
import { useCurrency, useStreak } from './hooks'
import { useSession } from './SessionContext'

const TABS = [
  { to: '/home', icon: '🏠', key: 'home' },
  { to: '/minigames', icon: '🎮', key: 'minigames' },
  { to: '/shop', icon: '🛍️', key: 'shop' },
  { to: '/friends', icon: '🤝', key: 'friends' },
  { to: '/profile', icon: '🙂', key: 'profile' },
] as const

export function AppShell() {
  const { t } = useTranslation()
  const { user, isDemoMode, demoUsers, switchDemoUser } = useSession()
  const streak = useStreak()
  const currency = useCurrency()

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col bg-cream sm:my-6 sm:min-h-[44rem] sm:rounded-[2.5rem] sm:border-8 sm:border-white sm:shadow-xl">
      {isDemoMode && (
        <div className="flex items-center justify-center gap-2 bg-lilac px-3 py-1.5 text-xs font-semibold text-ink">
          <span>Modo demo — viendo como:</span>
          {demoUsers.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => switchDemoUser(u.id)}
              className={`rounded-full px-2.5 py-0.5 ${u.id === user?.id ? 'bg-ink text-white' : 'bg-white/70 text-ink'}`}
            >
              {u.username}
            </button>
          ))}
        </div>
      )}

      <header className="flex items-center justify-between px-4 py-3 text-sm font-bold text-ink">
        <span title="Racha diaria del nido">🔥 {streak.data?.count ?? 0} días</span>
        <span title="Semillitas">🌱 {currency.data ?? 0}</span>
      </header>

      <main className="flex-1 overflow-y-auto pb-4">
        <Outlet />
      </main>

      <nav className="grid grid-cols-5 gap-1 border-t border-black/10 bg-white/80 px-1 py-2 text-center text-[10px] font-semibold text-ink-soft">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) => `flex flex-col items-center gap-0.5 rounded-xl py-1 ${isActive ? 'bg-blush text-ink' : ''}`}
          >
            <span className="text-base">{tab.icon}</span>
            {t(`nav.${tab.key}`)}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

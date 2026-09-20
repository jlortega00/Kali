import { Link } from 'react-router-dom'
import { MINIGAMES } from '@/config/gameConfig'

const PLAYABLE = new Set(['catch-food', 'memory-pairs'])

export default function MinigamesPage() {
  return (
    <div className="px-4 py-4">
      <h1 className="text-lg font-bold text-ink">Minijuegos</h1>
      <p className="mt-1 text-xs text-ink-soft">Partidas cortas para ganar Semillitas y hacer feliz a vuestra mascota.</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {MINIGAMES.map((game) => {
          const playable = PLAYABLE.has(game.id)
          const content = (
            <div className={`flex flex-col items-center gap-1 rounded-blob bg-white/70 p-4 text-center shadow-sm ${playable ? '' : 'opacity-50'}`}>
              <span className="text-3xl">{ICONS[game.id]}</span>
              <span className="text-xs font-bold text-ink">{game.name}</span>
              <span className="text-[10px] text-ink-soft">{playable ? `${game.durationSeconds}s` : 'Próximamente'}</span>
            </div>
          )
          return playable ? (
            <Link key={game.id} to={`/minigames/${game.id}`}>
              {content}
            </Link>
          ) : (
            <div key={game.id}>{content}</div>
          )
        })}
      </div>
    </div>
  )
}

const ICONS: Record<string, string> = {
  'catch-food': '🍙',
  'memory-pairs': '🧠',
  'rhythm-jump': '🎵',
  'star-fishing': '🎣',
  'async-record': '🏆',
  'scratch-card': '🎟️',
}

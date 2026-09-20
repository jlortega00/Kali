import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAwardCurrency } from '@/app/hooks'
import { useSession } from '@/app/SessionContext'
import { markDailyTaskDone } from '@/components/DailyTasksCard'
import { MINIGAMES } from '@/config/gameConfig'

const DURATION = MINIGAMES.find((m) => m.id === 'memory-pairs')!.durationSeconds
const ICONS = ['🍙', '🍓', '🧸', '🎈', '🍩', '🦴']

interface Card {
  id: number
  icon: string
  matched: boolean
}

function shuffledDeck(): Card[] {
  const pairs = [...ICONS, ...ICONS]
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pairs[i], pairs[j]] = [pairs[j], pairs[i]]
  }
  return pairs.map((icon, id) => ({ id, icon, matched: false }))
}

export default function MemoryPairsGame() {
  const navigate = useNavigate()
  const awardCurrency = useAwardCurrency()
  const { user } = useSession()

  const [deck, setDeck] = useState<Card[]>(() => shuffledDeck())
  const [flipped, setFlipped] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [finished, setFinished] = useState(false)

  const won = useMemo(() => deck.every((c) => c.matched), [deck])

  useEffect(() => {
    if (finished || won) return
    const timer = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(timer)
          setFinished(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [finished, won])

  useEffect(() => {
    if (won) setFinished(true)
  }, [won])

  useEffect(() => {
    if (!finished) return
    const reward = won ? 25 : Math.max(0, 15 - moves)
    if (reward > 0) awardCurrency.mutate(reward)
    if (user) markDailyTaskDone(user.id, 'minigame')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  const flipCard = (id: number) => {
    if (flipped.length === 2 || flipped.includes(id) || deck[id].matched || finished) return
    const next = [...flipped, id]
    setFlipped(next)

    if (next.length === 2) {
      setMoves((m) => m + 1)
      const [a, b] = next
      if (deck[a].icon === deck[b].icon) {
        setDeck((prev) => prev.map((c) => (c.id === a || c.id === b ? { ...c, matched: true } : c)))
        setFlipped([])
      } else {
        window.setTimeout(() => setFlipped([]), 700)
      }
    }
  }

  const restart = () => {
    setDeck(shuffledDeck())
    setFlipped([])
    setMoves(0)
    setTimeLeft(DURATION)
    setFinished(false)
  }

  if (finished) {
    const reward = won ? 25 : Math.max(0, 15 - moves)
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-4xl">{won ? '🎉' : '⏰'}</p>
        <p className="text-lg font-bold text-ink">{won ? `¡Completado en ${moves} intentos!` : 'Se acabó el tiempo'}</p>
        {reward > 0 && <p className="text-sm text-ink-soft">Ganaste {reward} 🌱 Semillitas</p>}
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={restart} className="rounded-full bg-sky/60 px-4 py-2 text-sm font-bold text-ink">
            Reintentar
          </button>
          <button type="button" onClick={() => navigate('/minigames')} className="rounded-full bg-blush-dark px-4 py-2 text-sm font-bold text-white">
            Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-4">
      <div className="mb-2 flex items-center justify-between text-sm font-bold text-ink">
        <span>⏱️ {timeLeft}s</span>
        <span>🔁 {moves} intentos</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {deck.map((card) => {
          const isFlipped = flipped.includes(card.id) || card.matched
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => flipCard(card.id)}
              className={`flex aspect-square items-center justify-center rounded-2xl text-2xl shadow-sm transition-colors ${
                isFlipped ? 'bg-white' : 'bg-lilac'
              } ${card.matched ? 'opacity-60' : ''}`}
            >
              {isFlipped ? card.icon : ''}
            </button>
          )
        })}
      </div>
    </div>
  )
}

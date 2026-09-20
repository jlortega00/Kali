import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAwardCurrency } from '@/app/hooks'
import { useSession } from '@/app/SessionContext'
import { markDailyTaskDone } from '@/components/DailyTasksCard'
import { ECONOMY_CONFIG, MINIGAMES } from '@/config/gameConfig'

const DURATION = MINIGAMES.find((m) => m.id === 'catch-food')!.durationSeconds
const FOOD_EMOJIS = ['🍙', '🍓', '🍩', '🥕', '🍞']
const AREA_HEIGHT = 380
const CATCH_ZONE_Y = AREA_HEIGHT - 60

interface FallingItem {
  id: number
  x: number
  y: number
  emoji: string
  speed: number
}

export default function CatchFoodGame() {
  const navigate = useNavigate()
  const awardCurrency = useAwardCurrency()
  const { user } = useSession()
  const areaRef = useRef<HTMLDivElement>(null)

  const [basketX, setBasketX] = useState(50)
  const [items, setItems] = useState<FallingItem[]>([])
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState(0)
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [finished, setFinished] = useState(false)

  const nextId = useRef(0)
  const lastSpawn = useRef(0)
  const rafRef = useRef<number>(0)

  const handlePointer = useCallback((clientX: number) => {
    const rect = areaRef.current?.getBoundingClientRect()
    if (!rect) return
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    setBasketX(pct)
  }, [])

  useEffect(() => {
    if (finished) return
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
  }, [finished])

  useEffect(() => {
    if (finished) return

    let lastTs = performance.now()
    const loop = (ts: number) => {
      const dt = (ts - lastTs) / 1000
      lastTs = ts

      if (ts - lastSpawn.current > 700) {
        lastSpawn.current = ts
        setItems((prev) => [
          ...prev,
          { id: nextId.current++, x: 10 + Math.random() * 80, y: -20, emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)], speed: 90 + Math.random() * 60 },
        ])
      }

      setItems((prev) => {
        const next: FallingItem[] = []
        for (const item of prev) {
          const newY = item.y + item.speed * dt
          if (newY >= CATCH_ZONE_Y && newY < CATCH_ZONE_Y + 40 && Math.abs(item.x - basketX) < 12) {
            setScore((s) => s + 1)
            continue
          }
          if (newY > AREA_HEIGHT) {
            setMisses((m) => m + 1)
            continue
          }
          next.push({ ...item, y: newY })
        }
        return next
      })

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, basketX])

  useEffect(() => {
    if (!finished) return
    const reward = Math.min(60, score * 2)
    if (reward > 0) awardCurrency.mutate(reward)
    if (user) markDailyTaskDone(user.id, 'minigame')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  if (finished) {
    const reward = Math.min(60, score * 2)
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-4xl">🎉</p>
        <p className="text-lg font-bold text-ink">¡Atrapaste {score} comidas!</p>
        <p className="text-sm text-ink-soft">Ganaste {reward} 🌱 Semillitas</p>
        <button type="button" onClick={() => navigate('/minigames')} className="mt-3 rounded-full bg-blush-dark px-5 py-2 text-sm font-bold text-white">
          Volver a minijuegos
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 py-4">
      <div className="mb-2 flex items-center justify-between text-sm font-bold text-ink">
        <span>⏱️ {timeLeft}s</span>
        <span>🍽️ {score}</span>
        <span className="text-ink-soft">Fallos: {misses}</span>
      </div>
      <div
        ref={areaRef}
        className="relative touch-none overflow-hidden rounded-blob bg-gradient-to-b from-sky/40 to-mint/40 select-none"
        style={{ height: AREA_HEIGHT }}
        onPointerMove={(e) => handlePointer(e.clientX)}
        onPointerDown={(e) => handlePointer(e.clientX)}
      >
        {items.map((item) => (
          <span key={item.id} className="absolute text-2xl" style={{ left: `${item.x}%`, top: item.y, transform: 'translateX(-50%)' }}>
            {item.emoji}
          </span>
        ))}
        <div className="absolute bottom-2 text-4xl" style={{ left: `${basketX}%`, transform: 'translateX(-50%)' }}>
          🧺
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-ink-soft">Mueve el dedo para deslizar la cesta y atrapar la comida.</p>
      <p className="mt-1 text-center text-[10px] text-ink-soft">Recompensa base: {ECONOMY_CONFIG.minigameBaseReward} 🌱 por partida bien jugada.</p>
    </div>
  )
}

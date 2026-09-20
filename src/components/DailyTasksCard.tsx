import { useEffect, useState } from 'react'
import { useAwardCurrency } from '@/app/hooks'
import { useSession } from '@/app/SessionContext'
import { ECONOMY_CONFIG, FEATURE_FLAGS, STREAK_CONFIG } from '@/config/gameConfig'

export type DailyTaskId = 'care' | 'minigame' | 'visit'

const TASKS: { id: DailyTaskId; label: string }[] = [
  { id: 'visit', label: 'Entra a ver a vuestra mascota' },
  { id: 'care', label: 'Hazle un cuidado (comida, mimo, limpieza o juego)' },
  { id: 'minigame', label: 'Juega una partida de un minijuego' },
]

function todayKey(userId: string) {
  return `nidito:daily:${userId}:${new Date().toISOString().slice(0, 10)}`
}

export function readDailyTasks(userId: string): Record<DailyTaskId, boolean> {
  try {
    const raw = window.localStorage.getItem(todayKey(userId))
    if (raw) return JSON.parse(raw)
  } catch {
    // sin almacenamiento: las tareas no persisten pero la sesión sigue funcionando
  }
  return { visit: true, care: false, minigame: false }
}

/** Marca una tarea diaria como completada (se llama desde las acciones reales: cuidar, jugar un minijuego). */
export function markDailyTaskDone(userId: string, task: DailyTaskId) {
  const current = readDailyTasks(userId)
  if (current[task]) return
  current[task] = true
  try {
    window.localStorage.setItem(todayKey(userId), JSON.stringify(current))
  } catch {
    // no pasa nada si no se guarda: se recalculará la próxima vez
  }
}

/** Racha compartida + cofre diario + tareas diarias, todo activable/desactivable desde gameConfig. */
export function DailyTasksCard() {
  const { user } = useSession()
  const awardCurrency = useAwardCurrency()
  const [tasks, setTasks] = useState<Record<DailyTaskId, boolean>>({ visit: true, care: false, minigame: false })
  const [chestClaimed, setChestClaimed] = useState(false)

  useEffect(() => {
    if (!user) return
    setTasks(readDailyTasks(user.id))
    try {
      setChestClaimed(window.localStorage.getItem(`nidito:chest:${user.id}:${new Date().toISOString().slice(0, 10)}`) === '1')
    } catch {
      setChestClaimed(false)
    }
  }, [user])

  if (!user || !FEATURE_FLAGS.dailyTasks) return null

  const completedCount = Object.values(tasks).filter(Boolean).length
  const allDone = completedCount === TASKS.length

  const claimChest = () => {
    if (!allDone || chestClaimed || !FEATURE_FLAGS.dailyChest) return
    awardCurrency.mutate(ECONOMY_CONFIG.dailyTaskReward)
    setChestClaimed(true)
    try {
      window.localStorage.setItem(`nidito:chest:${user.id}:${new Date().toISOString().slice(0, 10)}`, '1')
    } catch {
      // preferencia no persistida: no afecta al resto del juego
    }
  }

  return (
    <div className="mb-3 rounded-blob bg-white/70 p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-ink">Tareas de hoy</h2>
        <span className="text-[11px] text-ink-soft">
          {completedCount}/{TASKS.length}
        </span>
      </div>
      <ul className="mt-1.5 space-y-1">
        {TASKS.map((task) => (
          <li key={task.id} className="flex items-center gap-1.5 text-[11px] text-ink-soft">
            <span>{tasks[task.id] ? '✅' : '⬜️'}</span>
            <span className={tasks[task.id] ? 'line-through opacity-60' : ''}>{task.label}</span>
          </li>
        ))}
      </ul>
      {FEATURE_FLAGS.dailyChest && (
        <button
          type="button"
          disabled={!allDone || chestClaimed}
          onClick={claimChest}
          className="mt-2 w-full rounded-full bg-butter px-3 py-1.5 text-[11px] font-bold text-ink disabled:opacity-40"
        >
          {chestClaimed ? 'Cofre de hoy abierto 🎁' : allDone ? `Abrir cofre diario (+${ECONOMY_CONFIG.dailyTaskReward} 🌱)` : 'Completa las 3 tareas para el cofre 🎁'}
        </button>
      )}
      <p className="mt-1 text-center text-[10px] text-ink-soft">
        Día de gracia semanal: {STREAK_CONFIG.graceDaysPerWeek} si un día no podéis entrar.
      </p>
    </div>
  )
}

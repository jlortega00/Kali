import type { ReactNode } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useCareAction, useDevAdvanceTime, useMyNests, useNest, useUserNames, useWarmEgg } from '@/app/hooks'
import { useSession } from '@/app/SessionContext'
import { DailyTasksCard, markDailyTaskDone } from '@/components/DailyTasksCard'
import { NeedBar } from '@/components/NeedBar'
import { ShareCardButton } from '@/components/ShareCardModal'
import { EGG_CONFIG, GROWTH_STAGE_LABELS, NEED_IDS, SPECIES_LIST } from '@/config/gameConfig'
import { Egg } from '@/game/pets/Egg'
import { PetRenderer } from '@/game/pets/rig/PetRenderer'
import { SPECIES_VISUALS } from '@/game/pets/species'
import { crackStageForEgg, eggProgressRatio, warmthActionsToday } from '@/lib/game/logic'
import type { CareAction, PetState, User } from '@/lib/game/types'
import { timeAgo } from '@/lib/format'

const NEED_COLORS: Record<string, string> = {
  hunger: '#FFB6C8',
  fun: '#A6DCFB',
  hygiene: '#B0E8C9',
  energy: '#FFE38A',
  affection: '#CDB4F5',
}

const CARE_VERB_THIRD: Record<Exclude<CareAction, 'warm'>, string> = {
  feed: 'le dio de comer',
  clean: 'la limpió',
  pet: 'le hizo cariñitos',
  play: 'jugó con ella',
}

const CARE_VERB_SECOND: Record<Exclude<CareAction, 'warm'>, string> = {
  feed: 'le diste de comer',
  clean: 'la limpiaste',
  pet: 'le hiciste cariñitos',
  play: 'jugaste con ella',
}

const CARE_BUTTONS = [
  { action: 'feed' as const, icon: '🍙', label: 'Alimentar' },
  { action: 'clean' as const, icon: '🧼', label: 'Limpiar' },
  { action: 'pet' as const, icon: '💗', label: 'Acariciar' },
  { action: 'play' as const, icon: '🎈', label: 'Jugar' },
]

export default function HomePage() {
  const { user } = useSession()
  const nests = useMyNests()
  const [selectedNestId, setSelectedNestId] = useState<string | null>(null)

  const nestId = selectedNestId ?? nests.data?.[0]?.id
  const nestQuery = useNest(nestId)
  const warmEgg = useWarmEgg(nestId ?? '')
  const careAction = useCareAction(nestId ?? '')
  const devAdvance = useDevAdvanceTime(nestId ?? '')
  const memberNames = useUserNames(nestQuery.data?.memberIds ?? [])

  if (nests.isLoading) {
    return <CenteredMessage>Cargando vuestro nido…</CenteredMessage>
  }

  if (!nests.data || nests.data.length === 0) {
    return (
      <CenteredMessage>
        <p className="text-lg font-bold text-ink">Aún no tenéis ningún nido 🥚</p>
        <p className="mt-2 text-sm text-ink-soft">Añade a un amigo o pareja para incubar vuestro primer huevo.</p>
        <Link to="/friends" className="mt-4 inline-block rounded-full bg-blush-dark px-5 py-2 text-sm font-bold text-white">
          Ir a Amigos
        </Link>
      </CenteredMessage>
    )
  }

  const nest = nestQuery.data

  return (
    <div className="px-4 py-4">
      <DailyTasksCard />
      {nests.data.length > 1 && (
        <div className="mb-3 flex gap-2 overflow-x-auto">
          {nests.data.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setSelectedNestId(n.id)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${n.id === nestId ? 'bg-ink text-white' : 'bg-white/70 text-ink-soft'}`}
            >
              {n.pet?.name || n.pet?.speciesId || 'Huevo'}
            </button>
          ))}
        </div>
      )}

      {!nest && <CenteredMessage>Cargando…</CenteredMessage>}

      {nest?.egg && (
        <EggPanel
          nestId={nest.id}
          crackStage={crackStageForEgg(nest.egg)}
          progress={eggProgressRatio(nest.egg)}
          canWarm={user ? warmthActionsToday(nest.egg, user.id, new Date().toISOString()) < EGG_CONFIG.maxWarmthActionsPerDay : false}
          warmedToday={user ? warmthActionsToday(nest.egg, user.id, new Date().toISOString()) : 0}
          contributions={nest.egg.contributions}
          memberIds={nest.memberIds}
          memberNames={memberNames.data ?? {}}
          onWarm={() => warmEgg.mutate()}
          isWarming={warmEgg.isPending}
          error={warmEgg.error instanceof Error ? warmEgg.error.message : null}
        />
      )}

      {nest?.pet && (
        <PetPanel
          nestId={nest.id}
          pet={nest.pet}
          memberNames={memberNames.data ?? {}}
          currentUserId={user?.id}
          onCare={(action) => {
            careAction.mutate(action)
            if (user) markDailyTaskDone(user.id, 'care')
          }}
          isCaring={careAction.isPending}
          error={careAction.error instanceof Error ? careAction.error.message : null}
          onDevAdvance={() => devAdvance.mutate(24)}
        />
      )}
    </div>
  )
}

function CenteredMessage({ children }: { children: ReactNode }) {
  return <div className="flex min-h-[50vh] flex-col items-center justify-center px-8 text-center">{children}</div>
}

function EggPanel({
  crackStage,
  progress,
  canWarm,
  warmedToday,
  contributions,
  memberIds,
  memberNames,
  onWarm,
  isWarming,
  error,
}: {
  nestId: string
  crackStage: number
  progress: number
  canWarm: boolean
  warmedToday: number
  contributions: Record<string, number>
  memberIds: [string, string]
  memberNames: Record<string, User | null>
  onWarm: () => void
  isWarming: boolean
  error: string | null
}) {
  return (
    <div className="flex flex-col items-center rounded-blob bg-white/70 px-6 py-8 text-center shadow-sm">
      <Egg crackStage={crackStage} size={160} color="pink" />
      <p className="mt-3 text-sm font-bold text-ink">Vuestro huevo está incubándose</p>
      <div className="mt-2 h-3 w-full max-w-xs overflow-hidden rounded-full bg-black/10">
        <div className="h-full rounded-full bg-blush-dark transition-all" style={{ width: `${progress * 100}%` }} />
      </div>
      <p className="mt-1 text-xs text-ink-soft">{Math.round(progress * 100)}% del calor necesario</p>

      <div className="mt-4 w-full max-w-xs space-y-1 text-left text-xs text-ink-soft">
        {memberIds.map((id) => (
          <div key={id} className="flex justify-between">
            <span>{memberNames[id]?.username ?? id}</span>
            <span>{contributions[id] ?? 0} pts</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onWarm}
        disabled={!canWarm || isWarming}
        className="mt-5 rounded-full bg-blush-dark px-6 py-2.5 text-sm font-bold text-white shadow disabled:opacity-40"
      >
        {canWarm ? 'Dar calor 🤗' : 'Ya le diste calor hoy'}
      </button>
      <p className="mt-1 text-[11px] text-ink-soft">
        {warmedToday}/{EGG_CONFIG.maxWarmthActionsPerDay} veces hoy
      </p>
      {error && <p className="mt-2 text-xs font-semibold text-red-500">{error}</p>}
    </div>
  )
}

function PetPanel({
  pet,
  memberNames,
  currentUserId,
  onCare,
  isCaring,
  error,
  onDevAdvance,
}: {
  nestId: string
  pet: PetState
  memberNames: Record<string, User | null>
  currentUserId: string | undefined
  onCare: (action: Exclude<CareAction, 'warm'>) => void
  isCaring: boolean
  error: string | null
  onDevAdvance: () => void
}) {
  const { t } = useTranslation()
  const meta = SPECIES_LIST.find((s) => s.id === pet.speciesId)

  return (
    <div className="flex flex-col items-center rounded-blob bg-white/70 px-4 py-6 text-center shadow-sm">
      <PetRenderer species={SPECIES_VISUALS[pet.speciesId]} stage={pet.stage} expression={pet.needs.hunger < 30 ? 'hungry' : 'happy'} size={170} />
      <p className="mt-2 text-lg font-bold text-ink">{pet.name || meta?.name}</p>
      <p className="text-xs text-ink-soft">
        {meta?.name} · {GROWTH_STAGE_LABELS[pet.stage]}
      </p>

      <div className="mt-4 w-full max-w-xs space-y-1.5">
        {NEED_IDS.map((need) => (
          <NeedBar key={need} label={t(`needs.${need}`)} value={pet.needs[need]} color={NEED_COLORS[need]} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {CARE_BUTTONS.map((btn) => (
          <button
            key={btn.action}
            type="button"
            disabled={isCaring}
            onClick={() => onCare(btn.action)}
            className="flex flex-col items-center gap-1 rounded-2xl bg-sky/60 px-2 py-2 text-[11px] font-semibold text-ink disabled:opacity-40"
          >
            <span className="text-lg">{btn.icon}</span>
            {btn.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-xs font-semibold text-red-500">{error}</p>}

      {pet.careLog.length > 0 && (
        <div className="mt-4 w-full max-w-xs text-left text-[11px] text-ink-soft">
          <p className="mb-1 font-bold text-ink">Últimos cuidados</p>
          {pet.careLog.slice(0, 4).map((entry) => {
            const isMe = entry.userId === currentUserId
            const who = isMe ? 'Tú' : (memberNames[entry.userId]?.username ?? entry.userId)
            const verb = isMe ? CARE_VERB_SECOND[entry.action] : CARE_VERB_THIRD[entry.action]
            return (
              <p key={entry.id}>
                {who} {verb} {timeAgo(entry.createdAt)}
              </p>
            )
          })}
        </div>
      )}

      <ShareCardButton pet={pet} bornAt={pet.bornAt} />

      <button type="button" onClick={onDevAdvance} className="mt-3 rounded-full border border-dashed border-ink/30 px-3 py-1 text-[10px] text-ink-soft">
        🛠️ Dev: adelantar 24h
      </button>
    </div>
  )
}

import { useState } from 'react'
import { APP_NAME, GROWTH_STAGE_LABELS, SPECIES_LIST } from '@/config/gameConfig'
import { PetRenderer } from '@/game/pets/rig/PetRenderer'
import { SPECIES_VISUALS } from '@/game/pets/species'
import { daysSince } from '@/lib/format'
import type { PetState } from '@/lib/game/types'

export function ShareCardButton({ pet, bornAt }: { pet: PetState; bornAt: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="mt-2 rounded-full border border-ink/15 px-3 py-1 text-[11px] font-semibold text-ink-soft">
        🖼️ Tarjeta para compartir
      </button>
      {open && <ShareCardModal pet={pet} bornAt={bornAt} onClose={() => setOpen(false)} />}
    </>
  )
}

function ShareCardModal({ pet, bornAt, onClose }: { pet: PetState; bornAt: string; onClose: () => void }) {
  const meta = SPECIES_LIST.find((s) => s.id === pet.speciesId)
  const days = daysSince(bornAt)
  const shareText = `${pet.name || meta?.name} (${meta?.name}) lleva ${days} días con nosotros en ${APP_NAME} 🥚💕`

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText })
      } catch {
        // la persona canceló el share nativo: no hace falta hacer nada
      }
    } else {
      await navigator.clipboard?.writeText(shareText)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6" onClick={onClose}>
      <div
        className="flex w-full max-w-xs flex-col items-center rounded-[2rem] bg-gradient-to-b from-lilac to-sky p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-bold uppercase tracking-widest text-ink/70">{APP_NAME}</p>
        <PetRenderer species={SPECIES_VISUALS[pet.speciesId]} stage={pet.stage} expression="loved" size={140} animated={false} />
        <p className="mt-2 text-lg font-black text-ink">{pet.name || meta?.name}</p>
        <p className="text-xs text-ink-soft">
          {meta?.name} · {GROWTH_STAGE_LABELS[pet.stage]}
        </p>
        <p className="mt-3 rounded-full bg-white/60 px-3 py-1 text-xs font-bold text-ink">💕 {days} días juntos</p>

        <div className="mt-5 flex w-full gap-2">
          <button type="button" onClick={share} className="flex-1 rounded-full bg-blush-dark px-3 py-2 text-xs font-bold text-white">
            Compartir
          </button>
          <button type="button" onClick={onClose} className="flex-1 rounded-full bg-white/70 px-3 py-2 text-xs font-bold text-ink">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

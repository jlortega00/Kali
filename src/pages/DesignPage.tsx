import type { ReactNode } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  APP_NAME,
  EXPRESSIONS,
  GROWTH_STAGE_LABELS,
  GROWTH_STAGES,
  NEED_IDS,
  RARITY_LABELS,
  SPECIES_LIST,
} from '@/config/gameConfig'
import { NeedBar } from '@/components/NeedBar'
import { Egg } from '@/game/pets/Egg'
import { PetRenderer } from '@/game/pets/rig/PetRenderer'
import { SPECIES_VISUALS } from '@/game/pets/species'

const EXPRESSION_SAMPLE_SPECIES = ['gatito-mochi', 'axolotl-bubi', 'dragoncito-chispa'] as const

const PALETTE_SWATCHES = [
  { name: 'Crema', className: 'bg-cream border border-ink/10' },
  { name: 'Sonrosado', className: 'bg-blush' },
  { name: 'Cielo', className: 'bg-sky' },
  { name: 'Menta', className: 'bg-mint' },
  { name: 'Lila', className: 'bg-lilac' },
  { name: 'Mantequilla', className: 'bg-butter' },
]

const MOCK_NEEDS: Record<string, number> = {
  hunger: 78,
  fun: 62,
  hygiene: 85,
  energy: 54,
  affection: 91,
}

const NEED_COLORS: Record<string, string> = {
  hunger: '#FFB6C8',
  fun: '#A6DCFB',
  hygiene: '#B0E8C9',
  energy: '#FFE38A',
  affection: '#CDB4F5',
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10">
      <h2 className="text-2xl font-extrabold text-ink">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </section>
  )
}

export default function DesignPage() {
  const { t } = useTranslation()
  const [crackStage, setCrackStage] = useState(2)
  const [hatching, setHatching] = useState(false)

  return (
    <div className="min-h-screen bg-cream pb-20">
      <header className="border-b border-ink/10 bg-white/60 px-4 py-8 text-center backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-wide text-blush-dark">Fase 0 · Diseño</p>
        <h1 className="mt-1 text-3xl font-extrabold text-ink sm:text-4xl">{t('design.title')}</h1>
        <p className="mt-2 text-ink-soft">
          {t('design.subtitle', { appName: APP_NAME })} — {SPECIES_LIST.length} especies × {GROWTH_STAGES.length} etapas
        </p>
      </header>

      {/* 1. Hoja de personajes: 10 especies x 4 etapas */}
      <Section title={t('design.speciesSheet')} subtitle="Cada especie debe reconocerse como la misma criatura en sus 4 etapas.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-3">
            <thead>
              <tr>
                <th className="text-left text-sm font-semibold text-ink-soft">Especie</th>
                {GROWTH_STAGES.map((stage) => (
                  <th key={stage} className="text-sm font-semibold text-ink-soft">
                    {GROWTH_STAGE_LABELS[stage]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SPECIES_LIST.map((species) => (
                <tr key={species.id}>
                  <td className="align-middle">
                    <div className="text-sm font-bold text-ink">{species.name}</div>
                    <div className="text-xs text-ink-soft">{RARITY_LABELS[species.rarity]}</div>
                  </td>
                  {GROWTH_STAGES.map((stage) => (
                    <td key={stage} className="rounded-blob bg-white/70 p-2 text-center shadow-sm">
                      <PetRenderer species={SPECIES_VISUALS[species.id]} stage={stage} expression="happy" size={96} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* 2. Expresiones */}
      <Section title={t('design.expressions')} subtitle="Al menos 3 especies mostrando el set completo de expresiones.">
        <div className="space-y-8">
          {EXPRESSION_SAMPLE_SPECIES.map((id) => {
            const meta = SPECIES_LIST.find((s) => s.id === id)!
            return (
              <div key={id}>
                <h3 className="mb-3 text-sm font-bold text-ink">{meta.name}</h3>
                <div className="flex flex-wrap gap-3">
                  {EXPRESSIONS.map((expr) => (
                    <div key={expr} className="flex w-24 flex-col items-center rounded-blob bg-white/70 p-2 shadow-sm">
                      <PetRenderer species={SPECIES_VISUALS[id]} stage="adult" expression={expr} size={80} />
                      <span className="mt-1 text-center text-[11px] text-ink-soft">{t(`expressions.${expr}`)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      {/* 3. Huevo y eclosión */}
      <Section title={t('design.egg')} subtitle="Etapas de grietas a medida que se acerca la eclosión, y animación de eclosión.">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex flex-wrap gap-4">
            {[0, 1, 2, 3, 4].map((n) => (
              <div key={n} className="flex flex-col items-center rounded-blob bg-white/70 p-3 shadow-sm">
                <Egg crackStage={n} size={90} color="pink" />
                <span className="mt-1 text-[11px] text-ink-soft">Grieta {n}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center gap-3 rounded-blob bg-white/70 p-4 shadow-sm">
            <Egg crackStage={crackStage} hatching={hatching} size={120} color="pink" />
            <div className="flex gap-2">
              <input
                type="range"
                min={0}
                max={4}
                value={crackStage}
                onChange={(e) => setCrackStage(Number(e.target.value))}
                disabled={hatching}
              />
              <button
                type="button"
                onClick={() => {
                  setHatching(true)
                  window.setTimeout(() => setHatching(false), 1600)
                }}
                className="rounded-full bg-blush-dark px-4 py-1.5 text-xs font-bold text-white shadow"
              >
                Eclosionar ✨
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* 4. Paleta */}
      <Section title={t('design.palette')} subtitle="Paleta base de la app. Cada especie añade su propia paleta de 3-4 tonos (ver docs/pet-bible.md).">
        <div className="flex flex-wrap gap-4">
          {PALETTE_SWATCHES.map((swatch) => (
            <div key={swatch.name} className="flex flex-col items-center gap-1">
              <div className={`h-16 w-16 rounded-blob ${swatch.className}`} />
              <span className="text-xs text-ink-soft">{swatch.name}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* 5. Maqueta pantalla principal */}
      <Section title={t('design.homeMock')} subtitle="Maqueta estática, sin lógica: solo referencia visual del hogar.">
        <div className="mx-auto flex w-[320px] flex-col overflow-hidden rounded-[2.5rem] border-8 border-white bg-gradient-to-b from-sky to-mint shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 text-xs font-bold text-ink">
            <span>🔥 12 días</span>
            <span>🌱 340</span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-8">
            <PetRenderer species={SPECIES_VISUALS['dragoncito-chispa']} stage="teen" expression="loved" size={150} />
            <p className="text-sm font-bold text-ink">Chispa · Adolescente</p>
            <div className="w-full space-y-1.5">
              {NEED_IDS.map((need) => (
                <NeedBar key={need} label={t(`needs.${need}`)} value={MOCK_NEEDS[need]} color={NEED_COLORS[need]} />
              ))}
            </div>
          </div>
          <nav className="grid grid-cols-5 gap-1 border-t border-black/10 bg-white/70 px-2 py-2 text-center text-[10px] font-semibold text-ink-soft">
            {[
              { icon: '🏠', label: t('nav.home') },
              { icon: '🎮', label: t('nav.minigames') },
              { icon: '🛍️', label: t('nav.shop') },
              { icon: '🤝', label: t('nav.friends') },
              { icon: '🙂', label: t('nav.profile') },
            ].map((item) => (
              <span key={item.label} className="flex flex-col items-center gap-0.5">
                <span className="text-sm">{item.icon}</span>
                {item.label}
              </span>
            ))}
          </nav>
        </div>
      </Section>
    </div>
  )
}

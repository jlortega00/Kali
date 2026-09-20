import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useMyNests, useStreak } from '@/app/hooks'
import { useSession } from '@/app/SessionContext'
import { MIN_AGE_YEARS, SPECIES_LIST } from '@/config/gameConfig'
import { daysSince } from '@/lib/format'

const SOUND_KEY = 'nidito:sound-muted'

export default function ProfilePage() {
  const { t, i18n } = useTranslation()
  const { user, signOut, isDemoMode } = useSession()
  const streak = useStreak()
  const nests = useMyNests()
  const [muted, setMuted] = useState(() => {
    try {
      return window.localStorage.getItem(SOUND_KEY) === '1'
    } catch {
      return false
    }
  })
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!user) return null

  const discoveredSpecies = new Set((nests.data ?? []).map((n) => n.pet?.speciesId).filter(Boolean))

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    try {
      window.localStorage.setItem(SOUND_KEY, next ? '1' : '0')
    } catch {
      // almacenamiento no disponible: la preferencia solo dura esta sesión
    }
  }

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')
  }

  const deleteAccount = () => {
    try {
      window.localStorage.clear()
    } catch {
      // nada que limpiar
    }
    window.location.reload()
  }

  return (
    <div className="space-y-6 px-4 py-4">
      <section className="flex flex-col items-center rounded-blob bg-white/70 p-5 text-center shadow-sm">
        <span className="text-4xl">🙂</span>
        <p className="mt-1 text-lg font-bold text-ink">{user.username}</p>
        <p className="text-xs text-ink-soft">Código: {user.friendCode}</p>
        <p className="mt-1 text-xs text-ink-soft">Miembro desde hace {daysSince(user.createdAt)} días</p>
        <p className="mt-1 text-xs text-ink-soft">🔥 Racha: {streak.data?.count ?? 0} días</p>
      </section>

      <section className="rounded-blob bg-white/70 p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-bold text-ink">Álbum de especies</h2>
        <div className="grid grid-cols-5 gap-2">
          {SPECIES_LIST.map((s) => {
            const discovered = discoveredSpecies.has(s.id)
            return (
              <div
                key={s.id}
                title={discovered ? s.name : '???'}
                className={`flex aspect-square items-center justify-center rounded-xl text-lg ${discovered ? 'bg-butter' : 'bg-black/10 text-ink-soft'}`}
              >
                {discovered ? '✓' : '?'}
              </div>
            )
          })}
        </div>
        <p className="mt-2 text-[11px] text-ink-soft">
          {discoveredSpecies.size} / {SPECIES_LIST.length} especies descubiertas
        </p>
      </section>

      <section className="rounded-blob bg-white/70 p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-bold text-ink">Ajustes</h2>
        <div className="flex items-center justify-between py-1.5 text-sm">
          <span>Idioma</span>
          <button type="button" onClick={toggleLanguage} className="rounded-full bg-sky/60 px-3 py-1 text-xs font-bold">
            {i18n.language === 'es' ? 'Español' : 'English'}
          </button>
        </div>
        <div className="flex items-center justify-between py-1.5 text-sm">
          <span>Sonido</span>
          <button type="button" onClick={toggleMute} className="rounded-full bg-sky/60 px-3 py-1 text-xs font-bold">
            {muted ? '🔇 Silenciado' : '🔊 Activado'}
          </button>
        </div>
      </section>

      <section className="rounded-blob bg-white/70 p-4 shadow-sm text-sm">
        <h2 className="mb-2 text-sm font-bold text-ink">Privacidad</h2>
        <p className="text-xs text-ink-soft">Edad mínima confirmada: {MIN_AGE_YEARS}+ años. Sin publicidad personalizada.</p>
        <div className="mt-2 flex flex-col gap-1 text-xs font-semibold text-blush-dark">
          <Link to="/legal/privacy">Política de privacidad</Link>
          <Link to="/legal/terms">Términos de uso</Link>
        </div>
        <button
          type="button"
          onClick={() => window.alert('En la versión final, esto descargará un archivo JSON con todos tus datos.')}
          className="mt-3 rounded-full bg-black/5 px-3 py-1.5 text-xs font-semibold text-ink"
        >
          Exportar mis datos
        </button>
      </section>

      <section className="rounded-blob bg-white/70 p-4 shadow-sm">
        {isDemoMode ? (
          <button type="button" onClick={() => signOut()} className="w-full rounded-full bg-black/5 px-3 py-2 text-xs font-semibold text-ink">
            Cerrar sesión (demo)
          </button>
        ) : (
          <button type="button" onClick={() => signOut()} className="w-full rounded-full bg-black/5 px-3 py-2 text-xs font-semibold text-ink">
            {t('nav.profile')}: cerrar sesión
          </button>
        )}

        {!confirmDelete ? (
          <button type="button" onClick={() => setConfirmDelete(true)} className="mt-2 w-full rounded-full px-3 py-2 text-xs font-semibold text-red-500">
            Borrar mi cuenta
          </button>
        ) : (
          <div className="mt-2 rounded-xl bg-red-50 p-3 text-center">
            <p className="text-xs font-semibold text-red-600">¿Seguro? Esto borra todos tus datos locales de la demo.</p>
            <div className="mt-2 flex justify-center gap-2">
              <button type="button" onClick={deleteAccount} className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                Sí, borrar
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-full bg-black/10 px-3 py-1 text-xs font-bold">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

import { useState } from 'react'
import { useCurrency } from '@/app/hooks'
import { useSession } from '@/app/SessionContext'
import { FEATURE_FLAGS, SHOP_ITEMS } from '@/config/gameConfig'
import { repo } from '@/lib/db/index'

const KIND_LABELS: Record<string, string> = { food: 'Comida', toy: 'Juguetes', outfit: 'Ropa', decoration: 'Decoración' }

export default function ShopPage() {
  const { user } = useSession()
  const currency = useCurrency()
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState<string | null>(null)

  const buy = async (itemId: string, price: number, name: string) => {
    if (!user) return
    const balance = currency.data ?? 0
    if (balance < price) {
      setMessage('No te llega con tus Semillitas todavía. ¡Sigue jugando minijuegos!')
      return
    }
    setPending(itemId)
    await repo.addCurrency(user.id, -price)
    setMessage(`Compraste ${name} 🎉`)
    setPending(null)
    currency.refetch()
  }

  const groups = Object.entries(
    SHOP_ITEMS.reduce<Record<string, typeof SHOP_ITEMS>>((acc, item) => {
      ;(acc[item.kind] ??= []).push(item)
      return acc
    }, {}),
  )

  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-ink">Tienda</h1>
        <span className="text-sm font-bold text-ink">🌱 {currency.data ?? 0}</span>
      </div>

      {message && <p className="mb-3 rounded-xl bg-mint/60 px-3 py-2 text-xs font-semibold text-ink">{message}</p>}

      {groups.map(([kind, items]) => (
        <section key={kind} className="mb-4">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">{KIND_LABELS[kind]}</h2>
          <div className="grid grid-cols-2 gap-2">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={pending === item.id}
                onClick={() => buy(item.id, item.price, item.name)}
                className="flex flex-col items-center gap-1 rounded-blob bg-white/70 p-3 text-center shadow-sm disabled:opacity-50"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs font-semibold text-ink">{item.name}</span>
                <span className="text-[11px] text-ink-soft">🌱 {item.price}</span>
              </button>
            ))}
          </div>
        </section>
      ))}

      {!FEATURE_FLAGS.cosmeticShop && (
        <p className="mt-4 text-center text-[11px] text-ink-soft">
          La tienda con compras reales está preparada pero desactivada en esta versión.
        </p>
      )}
    </div>
  )
}

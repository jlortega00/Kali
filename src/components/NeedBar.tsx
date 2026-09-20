interface NeedBarProps {
  label: string
  value: number
  color: string
}

/** Barra de necesidad suave (sin números agobiantes), usada en la pantalla principal. */
export function NeedBar({ label, value, color }: NeedBarProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-xs font-semibold text-ink-soft">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/10">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

import type { SnoutType, SpeciesPalette } from '../types'

interface SnoutProps {
  headCx: number
  headCy: number
  headR: number
  type: SnoutType
  palette: SpeciesPalette
}

export function Snout({ headCx, headCy, headR, type, palette }: SnoutProps) {
  if (type === 'none') return null

  const x = headCx
  const y = headCy + headR * 0.22

  if (type === 'beak-round') {
    return (
      <path
        d={`M ${x - headR * 0.16} ${y}
            Q ${x} ${y + headR * 0.26} ${x + headR * 0.16} ${y}
            Q ${x} ${y - headR * 0.06} ${x - headR * 0.16} ${y}
            Z`}
        fill={palette.accent}
        stroke={palette.bodyDark}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    )
  }

  if (type === 'beak-flat') {
    return (
      <path
        d={`M ${x - headR * 0.26} ${y}
            Q ${x} ${y + headR * 0.22} ${x + headR * 0.26} ${y}
            Q ${x} ${y - headR * 0.1} ${x - headR * 0.26} ${y}
            Z`}
        fill={palette.accent}
        stroke={palette.bodyDark}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    )
  }

  return null
}

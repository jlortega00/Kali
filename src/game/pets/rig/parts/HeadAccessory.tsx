import type { HeadAccessoryType, SpeciesPalette } from '../types'

const BEHIND_HEAD_TYPES: HeadAccessoryType[] = ['gill-fronds', 'leaf-sprigs']

interface HeadAccessoryProps {
  headCx: number
  headCy: number
  headR: number
  scale: number
  type: HeadAccessoryType
  palette: SpeciesPalette
  /** 'behind' se pinta antes que la cabeza (branquias, hojas); 'front' después (plumón, cuernos). */
  slot: 'behind' | 'front'
}

/** Accesorios de cabeza que hacen reconocible a cada especie: branquias, hojitas, plumón, cuernos. */
export function HeadAccessory({ headCx, headCy, headR, scale, type, palette, slot }: HeadAccessoryProps) {
  if (type === 'none') return null
  const isBehind = BEHIND_HEAD_TYPES.includes(type)
  if (slot === 'behind' && !isBehind) return null
  if (slot === 'front' && isBehind) return null

  if (type === 'feather-tuft') {
    const x = headCx
    const y = headCy - headR
    return (
      <path
        d={`M ${x} ${y}
            q ${8 * scale} ${-18 * scale} ${2 * scale} ${-30 * scale}
            q ${10 * scale} ${8 * scale} ${4 * scale} ${24 * scale}
            Z`}
        fill={palette.accent}
        stroke={palette.bodyDark}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    )
  }

  if (type === 'dragon-horns') {
    const mkHorn = (side: 1 | -1) => (
      <path
        key={side}
        d={`M ${headCx + side * headR * 0.35} ${headCy - headR * 0.82}
            q ${side * 6 * scale} ${-20 * scale} ${side * 2 * scale} ${-30 * scale}
            q ${side * 8 * scale} ${8 * scale} ${side * 4 * scale} ${28 * scale}
            Z`}
        fill={palette.accent}
        stroke={palette.bodyDark}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    )
    return (
      <g>
        {mkHorn(-1)}
        {mkHorn(1)}
      </g>
    )
  }

  if (type === 'gill-fronds') {
    const mkSide = (side: 1 | -1) => {
      const baseX = headCx + side * headR * 0.92
      const baseY = headCy + headR * 0.05
      const fronds = [-1, 0, 1]
      return (
        <g key={side}>
          {fronds.map((f) => (
            <path
              key={f}
              d={`M ${baseX} ${baseY + f * 14 * scale}
                  q ${side * 22 * scale} ${f * 4 * scale} ${side * 20 * scale} ${-10 * scale + f * 6 * scale}
                  q ${side * -6 * scale} ${8 * scale} ${side * -20 * scale} ${4 * scale - f * 2 * scale}
                  Z`}
              fill={palette.accent}
              stroke={palette.bodyDark}
              strokeWidth={2}
              strokeLinejoin="round"
              opacity={0.95}
            />
          ))}
        </g>
      )
    }
    return (
      <g>
        {mkSide(-1)}
        {mkSide(1)}
      </g>
    )
  }

  if (type === 'leaf-sprigs') {
    const positions = [-0.9, -0.6, 0.6, 0.9]
    return (
      <g>
        {positions.map((p, i) => {
          const x = headCx + p * headR * 0.95
          const y = headCy - headR * (0.55 - Math.abs(p) * 0.15)
          return (
            <path
              key={i}
              d={`M ${x} ${y}
                  q ${8 * scale} ${-16 * scale} ${0} ${-26 * scale}
                  q ${-8 * scale} ${10 * scale} ${0} ${26 * scale}
                  Z`}
              fill={palette.accent}
              stroke={palette.bodyDark}
              strokeWidth={2}
              strokeLinejoin="round"
              transform={`rotate(${p * 40} ${x} ${y})`}
            />
          )
        })}
      </g>
    )
  }

  return null
}

import type { FaceMarkingType, SpeciesPalette } from '../types'

interface FaceMarkingProps {
  headCx: number
  headCy: number
  headR: number
  type: FaceMarkingType
  palette: SpeciesPalette
}

/** Marcas faciales dibujadas justo antes de los ojos: el parche oscuro del panda, etc. */
export function FaceMarking({ headCx, headCy, headR, type, palette }: FaceMarkingProps) {
  if (type === 'none') return null

  if (type === 'mask') {
    const mk = (side: 1 | -1) => (
      <ellipse
        key={side}
        cx={headCx + side * headR * 0.34}
        cy={headCy + headR * 0.02}
        rx={headR * 0.26}
        ry={headR * 0.3}
        fill={palette.accent}
      />
    )
    return (
      <g>
        {mk(-1)}
        {mk(1)}
      </g>
    )
  }

  if (type === 'cheek-stripes') {
    const mk = (side: 1 | -1) => (
      <path
        key={side}
        d={`M ${headCx + side * headR * 0.55} ${headCy + headR * 0.2}
            q ${side * 14} 4 ${side * 18} 14`}
        stroke={palette.accent}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        opacity={0.7}
      />
    )
    return (
      <g>
        {mk(-1)}
        {mk(1)}
      </g>
    )
  }

  return null
}

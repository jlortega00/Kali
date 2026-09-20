import type { EyeShape } from '../expressions'

interface EyesProps {
  headCx: number
  headCy: number
  headR: number
  shape: EyeShape
  /** Fuerza los ojos a un parpadeo cerrado, independientemente de `shape` (animación idle). */
  forceClosed?: boolean
  irisColor?: string
}

const EYE_OFFSET_X = 0.34
const EYE_OFFSET_Y = 0.02

export function Eyes({ headCx, headCy, headR, shape, forceClosed, irisColor = '#5B4A4A' }: EyesProps) {
  const leftX = headCx - headR * EYE_OFFSET_X
  const rightX = headCx + headR * EYE_OFFSET_X
  const y = headCy + headR * EYE_OFFSET_Y
  const r = headR * 0.18

  const closedCurve = (cx: number, cy: number, w: number) => (
    <path d={`M ${cx - w} ${cy} Q ${cx} ${cy + w * 0.9} ${cx + w} ${cy}`} stroke={irisColor} strokeWidth={r * 0.35} fill="none" strokeLinecap="round" />
  )

  const openEye = (cx: number, cy: number) => (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={irisColor} />
      <circle cx={cx - r * 0.32} cy={cy - r * 0.32} r={r * 0.34} fill="#fff" />
      <circle cx={cx + r * 0.28} cy={cy + r * 0.3} r={r * 0.16} fill="#fff" opacity={0.8} />
    </g>
  )

  const halfEye = (cx: number, cy: number) => (
    <path
      d={`M ${cx - r} ${cy} Q ${cx} ${cy - r * 0.5} ${cx + r} ${cy} L ${cx + r} ${cy + r * 0.3} Q ${cx} ${cy + r * 0.6} ${cx - r} ${cy + r * 0.3} Z`}
      fill={irisColor}
    />
  )

  const heartEye = (cx: number, cy: number) => (
    <path
      d={`M ${cx} ${cy + r * 0.85}
          C ${cx - r * 1.3} ${cy - r * 0.3}, ${cx - r * 0.5} ${cy - r * 1.15}, ${cx} ${cy - r * 0.35}
          C ${cx + r * 0.5} ${cy - r * 1.15}, ${cx + r * 1.3} ${cy - r * 0.3}, ${cx} ${cy + r * 0.85}
          Z`}
      fill="#FF6B8B"
    />
  )

  const starEye = (cx: number, cy: number) => {
    const points = Array.from({ length: 5 }, (_, i) => {
      const outer = i % 2 === 0
      const radius = outer ? r : r * 0.42
      const angle = (Math.PI / 5) * i * 2 - Math.PI / 2
      return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`
    })
    return <polygon points={points.join(' ')} fill="#FFC93C" stroke={irisColor} strokeWidth={1.5} strokeLinejoin="round" />
  }

  const renderEye = (cx: number, cy: number) => {
    if (forceClosed) return closedCurve(cx, cy, r)
    switch (shape) {
      case 'closed-curve':
        return closedCurve(cx, cy, r)
      case 'heart':
        return heartEye(cx, cy)
      case 'star':
        return starEye(cx, cy)
      case 'half':
        return halfEye(cx, cy)
      case 'open':
      case 'wink':
      default:
        return openEye(cx, cy)
    }
  }

  const rightIsClosed = shape === 'wink' && !forceClosed

  return (
    <g>
      {renderEye(leftX, y)}
      {rightIsClosed ? closedCurve(rightX, y, r) : renderEye(rightX, y)}
    </g>
  )
}

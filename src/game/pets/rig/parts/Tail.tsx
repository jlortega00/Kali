import type { SpeciesPalette, TailType } from '../types'

interface TailProps {
  bodyCx: number
  bodyCy: number
  bodyRx: number
  bodyRy: number
  scale: number
  type: TailType
  palette: SpeciesPalette
}

/** Cola dibujada detrás del cuerpo, asomando por el lado derecho. */
export function Tail({ bodyCx, bodyCy, bodyRx, bodyRy, scale, type, palette }: TailProps) {
  if (type === 'none') return null

  const x = bodyCx + bodyRx * 0.85
  const y = bodyCy + bodyRy * 0.35
  const fill = palette.body
  const stroke = palette.bodyDark

  switch (type) {
    case 'curl':
      return (
        <path
          d={`M ${x} ${y}
              C ${x + 18 * scale} ${y - 4 * scale} ${x + 22 * scale} ${y - 24 * scale} ${x + 4 * scale} ${y - 30 * scale}
              C ${x - 10 * scale} ${y - 34 * scale} ${x - 16 * scale} ${y - 18 * scale} ${x - 4 * scale} ${y - 14 * scale}
              C ${x + 2 * scale} ${y - 11 * scale} ${x + 4 * scale} ${y - 4 * scale} ${x} ${y}
              Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth={3}
          strokeLinejoin="round"
        />
      )
    case 'cloud':
      return (
        <g>
          <circle cx={x} cy={y} r={16 * scale} fill={fill} stroke={stroke} strokeWidth={3} />
          <circle cx={x + 10 * scale} cy={y - 10 * scale} r={11 * scale} fill={fill} stroke={stroke} strokeWidth={2.5} />
          <circle cx={x + 4 * scale} cy={y + 11 * scale} r={9 * scale} fill={fill} stroke={stroke} strokeWidth={2.5} />
        </g>
      )
    case 'bushy':
      return (
        <path
          d={`M ${x - 5 * scale} ${y}
              C ${x + 30 * scale} ${y - 35 * scale}, ${x + 55 * scale} ${y - 5 * scale}, ${x + 34 * scale} ${y + 30 * scale}
              C ${x + 22 * scale} ${y + 48 * scale}, ${x} ${y + 30 * scale}, ${x - 5 * scale} ${y}
              Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth={3}
          strokeLinejoin="round"
        />
      )
    case 'paddle':
      return (
        <ellipse
          cx={x + 6 * scale}
          cy={y}
          rx={24 * scale}
          ry={13 * scale}
          fill={fill}
          stroke={stroke}
          strokeWidth={3}
          transform={`rotate(-18 ${x} ${y})`}
        />
      )
    case 'spade':
      return (
        <path
          d={`M ${x} ${y}
              Q ${x + 18 * scale} ${y + 2 * scale} ${x + 26 * scale} ${y + 22 * scale}
              Q ${x + 34 * scale} ${y + 34 * scale} ${x + 22 * scale} ${y + 40 * scale}
              Q ${x + 10 * scale} ${y + 44 * scale} ${x + 8 * scale} ${y + 30 * scale}
              Q ${x + 4 * scale} ${y + 14 * scale} ${x} ${y}
              Z`}
          fill={palette.accent}
          stroke={stroke}
          strokeWidth={3}
          strokeLinejoin="round"
        />
      )
    case 'stub':
    default:
      return <circle cx={x - 6 * scale} cy={y} r={12 * scale} fill={fill} stroke={stroke} strokeWidth={3} />
  }
}

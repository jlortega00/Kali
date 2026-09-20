import type { AppendageType, SpeciesPalette } from '../types'

interface AppendageProps {
  bodyCx: number
  bodyCy: number
  bodyRx: number
  bodyRy: number
  scale: number
  type: AppendageType
  palette: SpeciesPalette
}

/** Alitas de dragón o aletas de pingüino, a los lados del cuerpo. */
export function Appendage({ bodyCx, bodyCy, bodyRx, bodyRy, scale, type, palette }: AppendageProps) {
  if (type === 'none') return null

  const mk = (side: 1 | -1) => {
    const x = bodyCx + side * bodyRx * 0.82
    const y = bodyCy - bodyRy * 0.1

    if (type === 'wings') {
      return (
        <path
          key={side}
          d={`M ${x} ${y}
              q ${side * 30 * scale} ${-18 * scale} ${side * 38 * scale} ${-2 * scale}
              q ${side * -8 * scale} ${18 * scale} ${side * -38 * scale} ${20 * scale}
              Z`}
          fill={palette.belly}
          stroke={palette.bodyDark}
          strokeWidth={2.5}
          strokeLinejoin="round"
          opacity={0.95}
        />
      )
    }

    // flippers
    return (
      <ellipse
        key={side}
        cx={x}
        cy={y + bodyRy * 0.3}
        rx={14 * scale}
        ry={28 * scale}
        fill={palette.bodyDark}
        stroke={palette.body}
        strokeWidth={2}
        transform={`rotate(${side * 24} ${x} ${y + bodyRy * 0.3})`}
      />
    )
  }

  return (
    <g>
      {mk(-1)}
      {mk(1)}
    </g>
  )
}

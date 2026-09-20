import type { SpeciesPalette } from '../types'

interface BodyProps {
  cx: number
  cy: number
  rx: number
  ry: number
  palette: SpeciesPalette
  detail: 'minimal' | 'basic' | 'full'
}

/** Cuerpo redondeado con barriguita de color más claro y patitas asomando. */
export function Body({ cx, cy, rx, ry, palette, detail }: BodyProps) {
  const footRy = ry * 0.18
  const footRx = rx * 0.22
  const footY = cy + ry * 0.92
  const bellyRx = rx * 0.62
  const bellyRy = ry * 0.68
  const bellyCy = cy + ry * 0.18

  return (
    <g>
      {detail !== 'minimal' && (
        <>
          <ellipse cx={cx - rx * 0.55} cy={footY} rx={footRx} ry={footRy} fill={palette.bodyDark} opacity={0.9} />
          <ellipse cx={cx + rx * 0.55} cy={footY} rx={footRx} ry={footRy} fill={palette.bodyDark} opacity={0.9} />
        </>
      )}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={palette.body} stroke={palette.bodyDark} strokeWidth={3} />
      <ellipse cx={cx} cy={bellyCy} rx={bellyRx} ry={bellyRy} fill={palette.belly} opacity={0.9} />
    </g>
  )
}

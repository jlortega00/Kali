interface CheeksProps {
  headCx: number
  headCy: number
  headR: number
  boost: number
  color?: string
}

/** Mejillas sonrosadas, siempre presentes pero más marcadas según la expresión. */
export function Cheeks({ headCx, headCy, headR, boost, color = '#FFB6C8' }: CheeksProps) {
  const rx = headR * 0.2 * Math.min(boost, 1.3)
  const ry = rx * 0.6
  const y = headCy + headR * 0.32
  const x = headR * 0.66

  return (
    <g opacity={0.55 + Math.min(boost, 1) * 0.35}>
      <ellipse cx={headCx - x} cy={y} rx={rx} ry={ry} fill={color} />
      <ellipse cx={headCx + x} cy={y} rx={rx} ry={ry} fill={color} />
    </g>
  )
}

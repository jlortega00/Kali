import { motion } from 'framer-motion'
import type { ExpressionExtra as ExtraType } from '../expressions'

interface ExpressionExtraProps {
  headCx: number
  headCy: number
  headR: number
  type: ExtraType
  animated: boolean
}

export function ExpressionExtra({ headCx, headCy, headR, type, animated }: ExpressionExtraProps) {
  if (type === 'none') return null

  if (type === 'zzz') {
    return (
      <text
        x={headCx + headR * 0.9}
        y={headCy - headR * 0.9}
        fontSize={headR * 0.32}
        fill="#8AA0C9"
        fontWeight={700}
        fontFamily="var(--font-sans, sans-serif)"
      >
        Z
      </text>
    )
  }

  if (type === 'tear') {
    return (
      <path
        d={`M ${headCx + headR * 0.5} ${headCy + headR * 0.1}
            q ${headR * 0.08} ${headR * 0.16} 0 ${headR * 0.24}
            q ${-headR * 0.08} ${-headR * 0.08} 0 ${-headR * 0.24}
            Z`}
        fill="#8FC9F0"
      />
    )
  }

  if (type === 'sparkles') {
    const dots = [
      { dx: -1.1, dy: -1.1, s: 1 },
      { dx: 1.15, dy: -0.9, s: 0.7 },
      { dx: 1.0, dy: 0.7, s: 0.6 },
    ]
    return (
      <g>
        {dots.map((d, i) => (
          <motion.path
            key={i}
            d={sparklePath(headCx + d.dx * headR, headCy + d.dy * headR, headR * 0.14 * d.s)}
            fill="#FFD86B"
            animate={animated ? { opacity: [0.4, 1, 0.4], scale: [0.85, 1.1, 0.85] } : undefined}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </g>
    )
  }

  if (type === 'hearts') {
    const hearts = [
      { dx: -1.05, dy: -0.7 },
      { dx: 1.1, dy: -0.85 },
    ]
    return (
      <g>
        {hearts.map((h, i) => (
          <motion.path
            key={i}
            d={heartPath(headCx + h.dx * headR, headCy + h.dy * headR, headR * 0.16)}
            fill="#FF6B8B"
            animate={animated ? { y: [0, -6, 0], opacity: [0.7, 1, 0.7] } : undefined}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </g>
    )
  }

  return null
}

function sparklePath(cx: number, cy: number, r: number) {
  return `M ${cx} ${cy - r} Q ${cx + r * 0.2} ${cy - r * 0.2} ${cx + r} ${cy} Q ${cx + r * 0.2} ${cy + r * 0.2} ${cx} ${cy + r} Q ${cx - r * 0.2} ${cy + r * 0.2} ${cx - r} ${cy} Q ${cx - r * 0.2} ${cy - r * 0.2} ${cx} ${cy - r} Z`
}

function heartPath(cx: number, cy: number, r: number) {
  return `M ${cx} ${cy + r * 0.85}
    C ${cx - r * 1.3} ${cy - r * 0.3}, ${cx - r * 0.5} ${cy - r * 1.15}, ${cx} ${cy - r * 0.35}
    C ${cx + r * 0.5} ${cy - r * 1.15}, ${cx + r * 1.3} ${cy - r * 0.3}, ${cx} ${cy + r * 0.85}
    Z`
}

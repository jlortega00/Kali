import type { MouthShape } from '../expressions'

interface MouthProps {
  headCx: number
  headCy: number
  headR: number
  shape: MouthShape
  color?: string
}

export function Mouth({ headCx, headCy, headR, shape, color = '#5B4A4A' }: MouthProps) {
  const x = headCx
  const y = headCy + headR * 0.42
  const w = headR * 0.16

  switch (shape) {
    case 'smile':
      return <path d={`M ${x - w} ${y} Q ${x} ${y + w * 0.9} ${x + w} ${y}`} stroke={color} strokeWidth={2.6} fill="none" strokeLinecap="round" />
    case 'flat':
      return <path d={`M ${x - w * 0.7} ${y} Q ${x} ${y + w * 0.15} ${x + w * 0.7} ${y}`} stroke={color} strokeWidth={2.6} fill="none" strokeLinecap="round" />
    case 'small-o':
      return <circle cx={x} cy={y} r={w * 0.35} fill={color} opacity={0.85} />
    case 'open-happy':
      return (
        <path
          d={`M ${x - w} ${y} Q ${x} ${y + w * 1.5} ${x + w} ${y} Q ${x} ${y + w * 0.6} ${x - w} ${y} Z`}
          fill="#B5555F"
          stroke={color}
          strokeWidth={2}
        />
      )
    case 'frown':
      return <path d={`M ${x - w} ${y + w * 0.5} Q ${x} ${y - w * 0.4} ${x + w} ${y + w * 0.5}`} stroke={color} strokeWidth={2.6} fill="none" strokeLinecap="round" />
    case 'wavy':
      return (
        <path
          d={`M ${x - w} ${y} q ${w * 0.5} ${w * 0.5} ${w} 0 q ${w * 0.5} ${w * 0.5} ${w} 0`}
          stroke={color}
          strokeWidth={2.4}
          fill="none"
          strokeLinecap="round"
        />
      )
    default:
      return null
  }
}

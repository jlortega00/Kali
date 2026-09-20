import type { Expression } from '@/config/gameConfig'

export type EyeShape = 'open' | 'closed-curve' | 'heart' | 'star' | 'wink' | 'half'
export type MouthShape = 'smile' | 'flat' | 'small-o' | 'open-happy' | 'frown' | 'wavy'
export type ExpressionExtra = 'none' | 'zzz' | 'sparkles' | 'tear' | 'hearts'

export interface ExpressionVisual {
  eyes: EyeShape
  mouth: MouthShape
  cheekBoost: number
  extra: ExpressionExtra
}

export const EXPRESSION_VISUALS: Record<Expression, ExpressionVisual> = {
  happy: { eyes: 'open', mouth: 'smile', cheekBoost: 1, extra: 'none' },
  neutral: { eyes: 'open', mouth: 'flat', cheekBoost: 0.6, extra: 'none' },
  hungry: { eyes: 'half', mouth: 'wavy', cheekBoost: 0.4, extra: 'none' },
  sleepy: { eyes: 'closed-curve', mouth: 'small-o', cheekBoost: 0.5, extra: 'zzz' },
  sad: { eyes: 'half', mouth: 'frown', cheekBoost: 0.3, extra: 'tear' },
  eating: { eyes: 'closed-curve', mouth: 'open-happy', cheekBoost: 1.2, extra: 'none' },
  loved: { eyes: 'heart', mouth: 'smile', cheekBoost: 1.4, extra: 'hearts' },
  playing: { eyes: 'wink', mouth: 'open-happy', cheekBoost: 1, extra: 'none' },
  celebrating: { eyes: 'star', mouth: 'open-happy', cheekBoost: 1.2, extra: 'sparkles' },
}

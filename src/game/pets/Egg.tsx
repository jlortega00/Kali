import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { EGG_CONFIG } from '@/config/gameConfig'

export interface EggProps {
  /** 0 = huevo intacto, EGG_CONFIG.crackStages = a punto de eclosionar. */
  crackStage?: number
  /** Si true, reproduce la animación de eclosión (el huevo se abre y desaparece). */
  hatching?: boolean
  size?: number
  className?: string
  animated?: boolean
  color?: 'cream' | 'pink' | 'sky' | 'mint' | 'lilac' | 'butter'
}

const EGG_COLORS: Record<NonNullable<EggProps['color']>, { body: string; dark: string }> = {
  cream: { body: '#FFF3E0', dark: '#E0B98A' },
  pink: { body: '#FFE0EC', dark: '#E0A0BC' },
  sky: { body: '#DFF0FE', dark: '#9CC7E8' },
  mint: { body: '#E1F7EA', dark: '#9FD6B6' },
  lilac: { body: '#ECE1FE', dark: '#B99CE8' },
  butter: { body: '#FFF3C4', dark: '#E0C25A' },
}

const CRACK_PATHS = [
  'M 100 55 L 92 80 L 104 95 L 90 118',
  'M 130 70 L 118 92 L 132 108',
  'M 72 95 L 84 112 L 74 132',
  'M 108 130 L 122 148 L 110 168',
]

export function Egg({ crackStage = 0, hatching = false, size = 160, className, animated = true, color = 'cream' }: EggProps) {
  const prefersReducedMotion = useReducedMotion()
  const playAnimations = animated && !prefersReducedMotion
  const palette = EGG_COLORS[color]
  const visibleCracks = Math.min(crackStage, EGG_CONFIG.crackStages, CRACK_PATHS.length)

  return (
    <div style={{ width: size, height: size }} className={className}>
      <AnimatePresence mode="wait">
        {!hatching ? (
          <motion.svg
            key="egg-intact"
            viewBox="0 0 200 220"
            width={size}
            height={size}
            role="img"
            aria-label={`Huevo, etapa de grietas ${visibleCracks} de ${EGG_CONFIG.crackStages}`}
            animate={playAnimations ? { rotate: [-1.5, 1.5, -1.5], y: [0, -3, 0] } : undefined}
            transition={playAnimations ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } : undefined}
          >
            <ellipse cx={100} cy={130} rx={68} ry={82} fill={palette.body} stroke={palette.dark} strokeWidth={4} />
            <ellipse cx={78} cy={95} rx={20} ry={26} fill="#fff" opacity={0.45} />
            {CRACK_PATHS.slice(0, visibleCracks).map((d, i) => (
              <motion.path
                key={i}
                d={d}
                stroke={palette.dark}
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            ))}
          </motion.svg>
        ) : (
          <motion.svg key="egg-hatching" viewBox="0 0 200 220" width={size} height={size} role="img" aria-label="El huevo está eclosionando">
            <motion.path
              d="M 32 128 Q 40 60 100 55 Q 160 60 168 128 Q 110 140 100 118 Q 90 140 32 128 Z"
              fill={palette.body}
              stroke={palette.dark}
              strokeWidth={4}
              initial={{ y: 0, rotate: 0 }}
              animate={{ y: -60, rotate: -25, opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeIn' }}
            />
            <motion.path
              d="M 32 132 Q 40 200 100 205 Q 160 200 168 132 Q 110 122 100 140 Q 90 122 32 132 Z"
              fill={palette.body}
              stroke={palette.dark}
              strokeWidth={4}
              initial={{ y: 0, rotate: 0 }}
              animate={{ y: 60, rotate: 15, opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeIn' }}
            />
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (Math.PI * 2 * i) / 8
              return (
                <motion.circle
                  key={i}
                  cx={100}
                  cy={128}
                  r={5}
                  fill="#FFD86B"
                  initial={{ opacity: 1, x: 0, y: 0 }}
                  animate={{ opacity: 0, x: Math.cos(angle) * 70, y: Math.sin(angle) * 70 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                />
              )
            })}
          </motion.svg>
        )}
      </AnimatePresence>
    </div>
  )
}

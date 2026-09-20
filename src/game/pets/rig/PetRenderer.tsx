import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ANIMATION_TIMING } from '@/config/gameConfig'
import { EXPRESSION_VISUALS } from './expressions'
import { Appendage } from './parts/Appendage'
import { Body } from './parts/Body'
import { Cheeks } from './parts/Cheeks'
import { Ears } from './parts/Ears'
import { ExpressionExtra } from './parts/ExpressionExtra'
import { Eyes } from './parts/Eyes'
import { FaceMarking } from './parts/FaceMarking'
import { HeadAccessory } from './parts/HeadAccessory'
import { Mouth } from './parts/Mouth'
import { Snout } from './parts/Snout'
import { Tail } from './parts/Tail'
import { STAGE_PROPORTIONS } from './proportions'
import type { PetRigProps } from './types'

const VIEWBOX = 220
const CENTER_X = VIEWBOX / 2

export function PetRenderer({ species, stage, expression = 'happy', size = 160, className, animated = true }: PetRigProps) {
  const proportions = STAGE_PROPORTIONS[stage]
  const visual = EXPRESSION_VISUALS[expression]
  const prefersReducedMotion = useReducedMotion()
  const playAnimations = animated && !prefersReducedMotion

  const headCx = CENTER_X
  const headCy = VIEWBOX / 2 - proportions.bodyOffsetY / 2.6
  const bodyCy = headCy + proportions.bodyOffsetY

  const [blink, setBlink] = useState(false)

  useEffect(() => {
    if (!playAnimations) return
    const id = window.setInterval(
      () => {
        setBlink(true)
        window.setTimeout(() => setBlink(false), ANIMATION_TIMING.blinkDurationSeconds * 1000)
      },
      ANIMATION_TIMING.blinkIntervalSeconds * 1000 + Math.random() * 1500,
    )
    return () => window.clearInterval(id)
  }, [playAnimations])

  return (
    <motion.svg
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`Mascota en etapa ${stage}, expresión ${expression}`}
      animate={playAnimations ? { y: [0, -4, 0] } : undefined}
      transition={playAnimations ? { duration: ANIMATION_TIMING.breathingSeconds, repeat: Infinity, ease: 'easeInOut' } : undefined}
      whileTap={playAnimations ? { scale: 0.94 } : undefined}
    >
      <Tail
        bodyCx={CENTER_X}
        bodyCy={bodyCy}
        bodyRx={proportions.bodyRx}
        bodyRy={proportions.bodyRy}
        scale={proportions.tailScale}
        type={species.tail}
        palette={species.palette}
      />

      <Ears
        headCx={headCx}
        headCy={headCy}
        headR={proportions.headRadius}
        scale={proportions.earScale}
        type={species.ear}
        color={species.earColor ?? 'body'}
        palette={species.palette}
      />

      {proportions.showAccessory && (
        <HeadAccessory
          headCx={headCx}
          headCy={headCy}
          headR={proportions.headRadius}
          scale={proportions.accessoryScale}
          type={species.headAccessory}
          palette={species.palette}
          slot="behind"
        />
      )}

      <Body cx={CENTER_X} cy={bodyCy} rx={proportions.bodyRx} ry={proportions.bodyRy} palette={species.palette} detail={proportions.detail} />

      {proportions.showAppendage && (
        <Appendage
          bodyCx={CENTER_X}
          bodyCy={bodyCy}
          bodyRx={proportions.bodyRx}
          bodyRy={proportions.bodyRy}
          scale={proportions.accessoryScale}
          type={species.appendage}
          palette={species.palette}
        />
      )}

      <circle cx={headCx} cy={headCy} r={proportions.headRadius} fill={species.palette.body} stroke={species.palette.bodyDark} strokeWidth={3.5} />

      {proportions.showAccessory && (
        <HeadAccessory
          headCx={headCx}
          headCy={headCy}
          headR={proportions.headRadius}
          scale={proportions.accessoryScale}
          type={species.headAccessory}
          palette={species.palette}
          slot="front"
        />
      )}

      {proportions.detail === 'full' && (
        <FaceMarking headCx={headCx} headCy={headCy} headR={proportions.headRadius} type={species.faceMarking} palette={species.palette} />
      )}

      <Snout headCx={headCx} headCy={headCy} headR={proportions.headRadius} type={species.snout} palette={species.palette} />

      <Cheeks headCx={headCx} headCy={headCy} headR={proportions.headRadius} boost={visual.cheekBoost} />

      <Eyes headCx={headCx} headCy={headCy} headR={proportions.headRadius} shape={visual.eyes} forceClosed={blink} />

      <Mouth headCx={headCx} headCy={headCy} headR={proportions.headRadius} shape={visual.mouth} />

      <ExpressionExtra headCx={headCx} headCy={headCy} headR={proportions.headRadius} type={visual.extra} animated={playAnimations} />
    </motion.svg>
  )
}

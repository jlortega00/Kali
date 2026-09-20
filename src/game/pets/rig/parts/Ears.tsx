import type { EarType, SpeciesPalette } from '../types'

interface EarsProps {
  headCx: number
  headCy: number
  headR: number
  scale: number
  type: EarType
  color: 'body' | 'accent'
  palette: SpeciesPalette
}

/**
 * Un par de orejas, dibujadas detrás de la cabeza (se pintan antes que ella).
 *
 * Cada variante se define primero "apuntando hacia arriba" desde un punto de
 * anclaje cercano al borde de la cabeza, y luego se rota hacia fuera con un
 * `transform`. Así el path nunca depende de `side` a mano (evita orejas
 * asimétricas) y el resultado es siempre un espejo perfecto izquierda/derecha.
 */
export function Ears({ headCx, headCy, headR, scale, type, color, palette }: EarsProps) {
  if (type === 'none') return null

  const fill = color === 'accent' ? palette.accent : palette.body
  const stroke = palette.bodyDark

  const oneEar = (side: 1 | -1) => {
    if (type === 'round') {
      const cx = headCx + side * headR * 0.68
      const cy = headCy - headR * 0.78
      return <circle key={side} cx={cx} cy={cy} r={headR * 0.38 * scale} fill={fill} stroke={stroke} strokeWidth={3} />
    }

    if (type === 'stubby') {
      const cx = headCx + side * headR * 0.72
      const cy = headCy - headR * 0.58
      return <circle key={side} cx={cx} cy={cy} r={headR * 0.22 * scale} fill={fill} stroke={stroke} strokeWidth={2.5} />
    }

    if (type === 'pointed') {
      const anchorX = headCx + side * headR * 0.62
      const anchorY = headCy - headR * 0.68
      const earH = headR * 0.62 * scale
      const earW = headR * 0.42 * scale
      const outer = `M ${anchorX - earW / 2} ${anchorY + earH * 0.15}
        Q ${anchorX - earW * 0.15} ${anchorY - earH * 0.6} ${anchorX} ${anchorY - earH}
        Q ${anchorX + earW * 0.15} ${anchorY - earH * 0.6} ${anchorX + earW / 2} ${anchorY + earH * 0.15}
        Q ${anchorX} ${anchorY + earH * 0.35} ${anchorX - earW / 2} ${anchorY + earH * 0.15}
        Z`
      const innerH = earH * 0.55
      const innerW = earW * 0.5
      const inner = `M ${anchorX - innerW / 2} ${anchorY}
        Q ${anchorX} ${anchorY - innerH * 0.9} ${anchorX} ${anchorY - innerH}
        Q ${anchorX} ${anchorY - innerH * 0.9} ${anchorX + innerW / 2} ${anchorY}
        Q ${anchorX} ${anchorY + innerH * 0.15} ${anchorX - innerW / 2} ${anchorY}
        Z`
      return (
        <g key={side} transform={`rotate(${side * 22} ${anchorX} ${anchorY})`}>
          <path d={outer} fill={fill} stroke={stroke} strokeWidth={2.5} strokeLinejoin="round" />
          <path d={inner} fill={palette.accent} opacity={0.8} />
        </g>
      )
    }

    if (type === 'floppy') {
      const anchorX = headCx + side * headR * 0.42
      const anchorY = headCy - headR * 0.85
      const rx = headR * 0.19 * scale
      const ry = headR * 0.6 * scale
      return (
        <g key={side} transform={`rotate(${side * 16} ${anchorX} ${anchorY})`}>
          <ellipse
            cx={anchorX}
            cy={anchorY + ry * 0.85}
            rx={rx}
            ry={ry}
            fill={fill}
            stroke={stroke}
            strokeWidth={2.5}
          />
          <ellipse cx={anchorX} cy={anchorY + ry * 0.9} rx={rx * 0.5} ry={ry * 0.65} fill={palette.accent} opacity={0.7} />
        </g>
      )
    }

    return null
  }

  return (
    <g>
      {oneEar(-1)}
      {oneEar(1)}
    </g>
  )
}

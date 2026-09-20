import type { StageProportionsMap } from './types'

/**
 * Proporciones compartidas por todas las especies en cada etapa. Esto es lo
 * que hace que las 4 etapas "se sientan" como el mismo ciclo de crecimiento
 * para cualquier criatura: bebé con cabeza enorme y sin detalle, hasta
 * adulto esbelto con accesorios completos.
 */
export const STAGE_PROPORTIONS: StageProportionsMap = {
  baby: {
    headRadius: 60,
    bodyRx: 40,
    bodyRy: 34,
    bodyOffsetY: 74,
    earScale: 0.55,
    tailScale: 0.4,
    limbScale: 0.45,
    accessoryScale: 0.4,
    showAccessory: false,
    showAppendage: false,
    detail: 'minimal',
  },
  child: {
    headRadius: 54,
    bodyRx: 47,
    bodyRy: 44,
    bodyOffsetY: 86,
    earScale: 0.78,
    tailScale: 0.7,
    limbScale: 0.65,
    accessoryScale: 0.65,
    showAccessory: true,
    showAppendage: false,
    detail: 'basic',
  },
  teen: {
    headRadius: 49,
    bodyRx: 52,
    bodyRy: 54,
    bodyOffsetY: 94,
    earScale: 1,
    tailScale: 0.95,
    limbScale: 0.85,
    accessoryScale: 0.9,
    showAccessory: true,
    showAppendage: true,
    detail: 'full',
  },
  adult: {
    headRadius: 46,
    bodyRx: 58,
    bodyRy: 62,
    bodyOffsetY: 100,
    earScale: 1.15,
    tailScale: 1.15,
    limbScale: 1,
    accessoryScale: 1,
    showAccessory: true,
    showAppendage: true,
    detail: 'full',
  },
}

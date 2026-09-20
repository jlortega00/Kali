import { describe, expect, it } from 'vitest'
import {
  EGG_CONFIG,
  GROWTH_STAGES,
  HATCH_RARITY_WEIGHTS,
  SPECIES_LIST,
} from './gameConfig'

describe('gameConfig', () => {
  it('tiene exactamente 10 especies', () => {
    expect(SPECIES_LIST).toHaveLength(10)
  })

  it('las probabilidades de rareza suman 1', () => {
    const total = Object.values(HATCH_RARITY_WEIGHTS).reduce((sum, w) => sum + w, 0)
    expect(total).toBeCloseTo(1)
  })

  it('reparte las especies entre las 3 rarezas según el diseño (6 comunes, 3 raras, 1 legendaria)', () => {
    const counts = { common: 0, rare: 0, legendary: 0 }
    for (const species of SPECIES_LIST) counts[species.rarity]++
    expect(counts).toEqual({ common: 6, rare: 3, legendary: 1 })
  })

  it('define las 4 etapas de crecimiento en orden', () => {
    expect(GROWTH_STAGES).toEqual(['baby', 'child', 'teen', 'adult'])
  })

  it('la contribución mínima por persona no supera el 50%', () => {
    expect(EGG_CONFIG.minContributionShare).toBeLessThanOrEqual(0.5)
  })
})

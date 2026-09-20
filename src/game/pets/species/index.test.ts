import { describe, expect, it } from 'vitest'
import { SPECIES_LIST } from '@/config/gameConfig'
import { SPECIES_VISUALS } from './index'

describe('SPECIES_VISUALS', () => {
  it('tiene una config visual para cada especie de gameConfig', () => {
    for (const species of SPECIES_LIST) {
      expect(SPECIES_VISUALS[species.id]).toBeDefined()
      expect(SPECIES_VISUALS[species.id].id).toBe(species.id)
    }
  })

  it('toda paleta define los 4 tonos requeridos', () => {
    for (const visual of Object.values(SPECIES_VISUALS)) {
      expect(visual.palette.body).toMatch(/^#/)
      expect(visual.palette.bodyDark).toMatch(/^#/)
      expect(visual.palette.belly).toMatch(/^#/)
      expect(visual.palette.accent).toMatch(/^#/)
    }
  })
})

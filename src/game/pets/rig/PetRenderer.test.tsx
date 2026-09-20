import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GROWTH_STAGES, SPECIES_LIST } from '@/config/gameConfig'
import { SPECIES_VISUALS } from '@/game/pets/species'
import { PetRenderer } from './PetRenderer'

describe('PetRenderer', () => {
  it('renderiza las 10 especies en sus 4 etapas sin errores', () => {
    for (const species of SPECIES_LIST) {
      for (const stage of GROWTH_STAGES) {
        const { unmount, container } = render(
          <PetRenderer species={SPECIES_VISUALS[species.id]} stage={stage} animated={false} />,
        )
        expect(container.querySelector('svg')).not.toBeNull()
        unmount()
      }
    }
  })
})

import { describe, expect, it } from 'vitest'
import { EGG_CONFIG, GROWTH_REQUIREMENTS, HATCH_RARITY_WEIGHTS, SPECIES_LIST } from '@/config/gameConfig'
import {
  addEggContribution,
  applyCareAction,
  canWarmEggToday,
  computeGrowthStage,
  crackStageForEgg,
  decayNeeds,
  eggTotalPoints,
  fullNeeds,
  isEggReadyToHatch,
  resolveHatchSpecies,
  updateStreakOnVisit,
  warmthActionsToday,
} from './logic'
import type { EggState, StreakState } from './types'

describe('decayNeeds', () => {
  it('no cambia nada si no ha pasado tiempo', () => {
    const needs = fullNeeds()
    const result = decayNeeds(needs, '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z')
    expect(result).toEqual(needs)
  })

  it('baja con el tiempo pero nunca por debajo del suelo', () => {
    const needs = fullNeeds()
    const result = decayNeeds(needs, '2026-01-01T00:00:00Z', '2026-01-10T00:00:00Z')
    for (const value of Object.values(result)) {
      expect(value).toBeGreaterThanOrEqual(5)
      expect(value).toBeLessThan(100)
    }
  })
})

describe('applyCareAction', () => {
  it('feed sube el hambre sin pasar de 100', () => {
    const needs = fullNeeds()
    needs.hunger = 90
    const result = applyCareAction(needs, 'feed')
    expect(result.hunger).toBe(100)
  })

  it('play cuesta energía', () => {
    const needs = fullNeeds()
    const result = applyCareAction(needs, 'play')
    expect(result.energy).toBeLessThan(100)
    expect(result.fun).toBe(100)
  })
})

describe('computeGrowthStage', () => {
  it('empieza en bebé', () => {
    expect(computeGrowthStage('2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z', 0)).toBe('baby')
  })

  it('no avanza solo por tiempo si falta cariño', () => {
    const req = GROWTH_REQUIREMENTS.child
    const now = new Date(new Date('2026-01-01T00:00:00Z').getTime() + (req.minDays + 5) * 86400000).toISOString()
    expect(computeGrowthStage('2026-01-01T00:00:00Z', now, 0)).toBe('baby')
  })

  it('avanza a niño cuando cumple días y cariño', () => {
    const req = GROWTH_REQUIREMENTS.child
    const now = new Date(new Date('2026-01-01T00:00:00Z').getTime() + (req.minDays + 1) * 86400000).toISOString()
    expect(computeGrowthStage('2026-01-01T00:00:00Z', now, req.minAffectionPoints)).toBe('child')
  })

  it('nunca retrocede de etapa (usa la más alta alcanzada)', () => {
    const adultReq = GROWTH_REQUIREMENTS.adult
    const now = new Date(new Date('2026-01-01T00:00:00Z').getTime() + (adultReq.minDays + 1) * 86400000).toISOString()
    expect(computeGrowthStage('2026-01-01T00:00:00Z', now, adultReq.minAffectionPoints)).toBe('adult')
  })
})

describe('huevo', () => {
  const emptyEgg: EggState = { contributions: {}, warmthLog: [], createdAt: '2026-01-01T00:00:00Z' }

  it('suma aportaciones por usuario', () => {
    let egg = addEggContribution(emptyEgg, 'a', 10)
    egg = addEggContribution(egg, 'a', 5)
    egg = addEggContribution(egg, 'b', 20)
    expect(eggTotalPoints(egg)).toBe(35)
    expect(egg.contributions.a).toBe(15)
  })

  it('no está listo si no llega al objetivo', () => {
    let egg = addEggContribution(emptyEgg, 'a', 40)
    egg = addEggContribution(egg, 'b', 40)
    expect(isEggReadyToHatch(egg, ['a', 'b'])).toBe(false)
  })

  it('no está listo si uno aportó menos del mínimo aunque el total llegue', () => {
    let egg = addEggContribution(emptyEgg, 'a', 95)
    egg = addEggContribution(egg, 'b', 5)
    expect(eggTotalPoints(egg)).toBeGreaterThanOrEqual(EGG_CONFIG.hatchPointsTarget)
    expect(isEggReadyToHatch(egg, ['a', 'b'])).toBe(false)
  })

  it('está listo cuando ambos superan la cuota mínima y el total llega', () => {
    let egg = addEggContribution(emptyEgg, 'a', 50)
    egg = addEggContribution(egg, 'b', 50)
    expect(isEggReadyToHatch(egg, ['a', 'b'])).toBe(true)
  })

  it('crackStageForEgg crece con el progreso', () => {
    expect(crackStageForEgg(emptyEgg)).toBe(0)
    const full = addEggContribution(emptyEgg, 'a', EGG_CONFIG.hatchPointsTarget)
    expect(crackStageForEgg(full)).toBe(EGG_CONFIG.crackStages)
  })
})

describe('límite diario de calor', () => {
  it('cuenta solo las acciones del mismo día', () => {
    const egg: EggState = {
      contributions: {},
      warmthLog: [
        { userId: 'a', createdAt: '2026-03-02T08:00:00Z' },
        { userId: 'a', createdAt: '2026-03-02T20:00:00Z' },
        { userId: 'a', createdAt: '2026-03-01T20:00:00Z' },
        { userId: 'b', createdAt: '2026-03-02T09:00:00Z' },
      ],
      createdAt: '2026-03-01T00:00:00Z',
    }
    expect(warmthActionsToday(egg, 'a', '2026-03-02T23:00:00Z')).toBe(2)
    expect(canWarmEggToday(egg, 'a', '2026-03-02T23:00:00Z')).toBe(true)
  })

  it('bloquea al llegar al máximo diario', () => {
    const egg: EggState = {
      contributions: {},
      warmthLog: Array.from({ length: 6 }, (_, i) => ({ userId: 'a', createdAt: `2026-03-02T0${i}:00:00Z` })),
      createdAt: '2026-03-01T00:00:00Z',
    }
    expect(canWarmEggToday(egg, 'a', '2026-03-02T23:00:00Z')).toBe(false)
  })
})

describe('resolveHatchSpecies', () => {
  it('respeta un roll fijo en el rango común', () => {
    const species = resolveHatchSpecies(() => 0.1)
    const meta = SPECIES_LIST.find((s) => s.id === species)
    expect(meta?.rarity).toBe('common')
  })

  it('respeta un roll fijo en el rango legendario', () => {
    const species = resolveHatchSpecies(() => 0.999)
    const meta = SPECIES_LIST.find((s) => s.id === species)
    expect(meta?.rarity).toBe('legendary')
  })

  it('la distribución aproxima los pesos configurados en muchas tiradas', () => {
    const counts: Record<string, number> = { common: 0, rare: 0, legendary: 0 }
    const N = 5000
    let seed = 42
    const rng = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    for (let i = 0; i < N; i++) {
      const species = resolveHatchSpecies(rng)
      const meta = SPECIES_LIST.find((s) => s.id === species)!
      counts[meta.rarity]++
    }
    expect(counts.common / N).toBeCloseTo(HATCH_RARITY_WEIGHTS.common, 1)
    expect(counts.legendary / N).toBeCloseTo(HATCH_RARITY_WEIGHTS.legendary, 1)
  })
})

describe('updateStreakOnVisit', () => {
  const empty: StreakState = { count: 0, lastVisitDate: null, graceUsedThisWeek: false, weekStartDate: null }

  it('primera visita pone la racha a 1', () => {
    const result = updateStreakOnVisit(empty, '2026-03-02')
    expect(result.count).toBe(1)
  })

  it('visitar dos días seguidos sube la racha', () => {
    const day1 = updateStreakOnVisit(empty, '2026-03-02')
    const day2 = updateStreakOnVisit(day1, '2026-03-03')
    expect(day2.count).toBe(2)
  })

  it('visitar el mismo día dos veces no cambia la racha', () => {
    const day1 = updateStreakOnVisit(empty, '2026-03-02')
    const again = updateStreakOnVisit(day1, '2026-03-02')
    expect(again.count).toBe(1)
  })

  it('saltarse un día usa el día de gracia semanal y mantiene la racha', () => {
    const day1 = updateStreakOnVisit(empty, '2026-03-02') // lunes
    const day3 = updateStreakOnVisit(day1, '2026-03-04') // miércoles, se saltó el martes
    expect(day3.count).toBe(2)
    expect(day3.graceUsedThisWeek).toBe(true)
  })

  it('saltarse dos días seguidos rompe la racha', () => {
    const day1 = updateStreakOnVisit(empty, '2026-03-02')
    const day4 = updateStreakOnVisit(day1, '2026-03-05')
    expect(day4.count).toBe(1)
  })
})

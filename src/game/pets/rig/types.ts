import type { Expression, GrowthStage, SpeciesId } from '@/config/gameConfig'

export type EarType = 'round' | 'floppy' | 'pointed' | 'stubby' | 'none'
export type TailType = 'stub' | 'cloud' | 'curl' | 'bushy' | 'paddle' | 'spade' | 'none'
export type HeadAccessoryType = 'none' | 'feather-tuft' | 'gill-fronds' | 'leaf-sprigs' | 'dragon-horns'
export type SnoutType = 'none' | 'beak-round' | 'beak-flat'
export type FaceMarkingType = 'none' | 'mask' | 'cheek-stripes'
/** Apéndice lateral opcional: alitas de dragón o aletas de pingüino. */
export type AppendageType = 'none' | 'wings' | 'flippers'

/**
 * Paleta propia de cada especie: 3-4 tonos pastel. `bodyDark` es el mismo
 * tono que `body` pero más oscuro, y se usa como "contorno" en vez de negro
 * puro (ver docs/pet-bible.md).
 */
export interface SpeciesPalette {
  body: string
  bodyDark: string
  belly: string
  accent: string
}

/**
 * Silueta y color de una especie. Las 4 etapas de crecimiento reutilizan
 * esta misma config: lo que cambia entre etapas son las `StageProportions`
 * (ver proportions.ts), no la silueta en sí, para que la especie se
 * reconozca en todas sus etapas.
 */
export interface SpeciesVisualConfig {
  id: SpeciesId
  ear: EarType
  /** Color de las orejas: el del cuerpo, o el de acento (p. ej. parches oscuros del panda). */
  earColor?: 'body' | 'accent'
  tail: TailType
  headAccessory: HeadAccessoryType
  snout: SnoutType
  faceMarking: FaceMarkingType
  appendage: AppendageType
  palette: SpeciesPalette
}

export interface StageProportions {
  headRadius: number
  bodyRx: number
  bodyRy: number
  /** Distancia vertical entre el centro de la cabeza y el centro del cuerpo. */
  bodyOffsetY: number
  earScale: number
  tailScale: number
  limbScale: number
  accessoryScale: number
  showAccessory: boolean
  showAppendage: boolean
  detail: 'minimal' | 'basic' | 'full'
}

export type StageProportionsMap = Record<GrowthStage, StageProportions>

export interface PetRigProps {
  species: SpeciesVisualConfig
  stage: GrowthStage
  expression?: Expression
  /** Tamaño del lienzo en px (el SVG es cuadrado). */
  size?: number
  className?: string
  /** Desactiva animaciones idle (respiración/parpadeo), p. ej. para hojas de personajes estáticas. */
  animated?: boolean
}

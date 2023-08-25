import { type Game } from '../game'
import { type Tween } from './tween'
import { uniqueId } from './utils'
import { type Value2D } from './value2d'

export interface EntityOptions {
  busy: boolean
  check: (other: Partial<Entity>) => void
  draw: () => void
  flipX: boolean
  flipY: boolean
  game: Game
  id?: string
  npc: boolean
  path?: Value2D[] | null
  pathIndex: number
  position: Value2D
  steps: number
  stepsRemaining: number
  tile?: number | null
  tween?: Tween | null
  type: 'building' | 'player' | undefined
  update: () => void
}

export class Entity implements EntityOptions {
  busy = false
  check: (other: Partial<Entity>) => void
  draw: () => void
  flipX = false
  flipY = false
  game: Game
  id = uniqueId()
  npc = true
  path: Value2D[] | null = null
  pathIndex = 0
  position: Value2D
  steps = 8
  stepsRemaining = 0
  tile: number | null = null
  tween: Tween | null = null
  type: 'building' | 'player' | undefined
  update: () => void

  constructor (options: Partial<EntityOptions>) {
    Object.assign(this, options)

    // Ensure that required properties are provided
    if (!options.game) {
      throw new Error('Entity must be instantiated with a game instance')
    }
    this.type = options.type
    this.game = options.game
    this.position = options.position ?? { x: 0, y: 0 }
    this.update = options.update ?? (() => {})
    this.draw = options.draw ?? (() => {})
    this.check = options.check ?? (() => {})
  }
}

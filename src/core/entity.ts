import { type Game } from '../game'
import { type Tween } from './tween'
import { uniqueId } from './uniqueId'
import { type Value2D } from './value2d'

interface EntityOptions {
  busy: boolean
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
  update: () => void
}

export class Entity implements EntityOptions {
  busy = false
  flipX = false
  flipY = false
  id = uniqueId()
  npc = true
  path: Value2D[] | null = null
  pathIndex = 0
  steps = 8
  stepsRemaining = 0
  tile: number | null = null
  tween: Tween | null = null

  // These are required and will be provided through the constructor
  game: Game
  position: Value2D
  update: () => void
  draw: () => void

  constructor (options: Partial<EntityOptions>) {
    Object.assign(this, options)

    // Ensure that required properties are provided
    if (!options.game) {
      throw new Error('Entity must be instantiated with a game instance')
    }
    this.game = options.game
    this.position = options.position ?? { x: 0, y: 0 }
    this.update = options.update ?? (() => {})
    this.draw = options.draw ?? (() => {})
  }
}

import { type Game } from '../game'
import { Entities } from './entities'

interface GameStateOptions {
  game: Game
  init: () => void
  update: (dt: number) => void
  draw: (dt: number) => void
  entities: Entities
}

export class GameState implements GameStateOptions {
  game: Game
  init: () => void
  update: (dt: number) => void
  draw: (dt: number) => void
  entities: Entities

  constructor (options: GameStateOptions) {
    this.game = options.game
    this.init = options.init ?? (() => {})
    this.update = options.update ?? (() => {})
    this.draw = options.draw ?? (() => {})
    this.entities = options.entities ?? new Entities({})
  }
}

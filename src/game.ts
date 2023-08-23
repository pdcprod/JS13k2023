import { Canvas } from './core/canvas'
import { Entities } from './core/entities'
import { type Entity } from './core/entity'
import { Fog } from './core/fog'
import { type GameState } from './core/gameState'
import { Input } from './core/input'
import { Level } from './core/level'
import { Text } from './core/text'
import { type Value2D } from './core/value2d'
import Sprites from './sprites'

interface GameOptions {
  init?: () => void
  update?: (dt: number) => void
  draw?: (dt: number) => void
  size?: number
  density?: number
  state?: GameState
}

export class Game {
  camera: Value2D = { x: 0, y: 0 }
  turn: number = 0
  turnPlayer: Entity | null = null
  entities = new Entities({})
  players: Entity[] = []
  player: Entity | null = null
  text: Text
  state: GameState | null = null

  canvas = new Canvas(document.getElementById('canvas') as HTMLCanvasElement)
  input = new Input(this.canvas.canvas)
  map: Level
  fog: Fog

  init = () => {}

  constructor (options: Partial<GameOptions> = {}) {
    const { size = 64, init } = options

    this.map = new Level(size)
    this.fog = new Fog(size)
    this.text = new Text({ canvas: this.canvas })

    if (init) this.init = init
  }

  update = (dt: number) => {
    this.state?.update(dt)
  }

  draw = (dt: number) => {
    this.state?.draw(dt)
  }

  // Set state
  setState (state: GameState) {
    this.state = state
    this.state.init()
  }

  // Turn control methods
  turnStart () {
    this.turn = 0
    this.setTurnPlayer()
  }

  turnNext () {
    this.turn += 1
    this.setTurnPlayer()
  }

  private setTurnPlayer () {
    const turnIndex = this.turn % this.players.length
    this.turnPlayer = this.players[turnIndex]
    if (this.turnPlayer) {
      this.turnPlayer.stepsRemaining = this.turnPlayer.steps
    }
  }

  // Rendering methods
  drawMap () {
    for (let y = 0; y < this.map.size; y += 1) {
      for (let x = 0; x < this.map.size; x += 1) {
        // Draw tile considering camera position
        this.canvas.drawTile({
          x: Math.round(x * Sprites.size - this.camera.x),
          y: Math.round(y * Sprites.size - this.camera.y),
          tile: this.map.tiles[y][x] + 1
        })
      }
    }
  }

  drawFog () {
    this.fog.grid.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile === 0) return
        const color = tile < 1 ? `rgba(0, 0, 0, ${tile})` : 'rgba(0, 0, 0, 1)'
        this.canvas.drawRect(
          Math.round(x * Sprites.size - this.camera.x),
          Math.round(y * Sprites.size - this.camera.y),
          Sprites.size,
          Sprites.size,
          color
        )
      })
    })
  }
}

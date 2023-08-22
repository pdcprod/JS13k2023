import { Canvas } from './core/canvas'
import { Entities } from './core/entities'
import { type Entity } from './core/entity'
import { Fog } from './core/fog'
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
}

export class Game {
  camera: Value2D = { x: 0, y: 0 }
  turn: number = 0
  turnPlayer: Entity | null = null
  entities = new Entities({})
  players: Entity[] = []
  player: Entity | null = null
  text: Text

  canvas = new Canvas(document.getElementById('canvas') as HTMLCanvasElement)
  input = new Input(this.canvas.canvas)
  map: Level
  fog: Fog

  init = () => {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update = (dt: number) => {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  draw = (dt: number) => {}

  constructor (options: Partial<GameOptions> = {}) {
    const { size = 64, density = 0.65, init, update, draw } = options

    this.map = new Level(size, density)
    this.fog = new Fog(size)
    this.text = new Text({ canvas: this.canvas })

    if (init) this.init = init
    if (update) this.update = update
    if (draw) this.draw = draw
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
    this.map.tiles.forEach((row, x) => {
      row.forEach((tile, y) => {
        // Draw tile considering camera position
        this.canvas.drawTile({
          x: Math.round(x * Sprites.size - this.camera.x),
          y: Math.round(y * Sprites.size - this.camera.y),
          tile: tile + 1
        })
      })
    })
  }

  drawFog () {
    this.fog.grid.forEach((row, x) => {
      row.forEach((tile, y) => {
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

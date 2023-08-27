import { Entity, type EntityOptions } from './core/entity'
import { type Game } from './game'
import Sprites from './sprites'

export const createBuilding = (game: Game, properties: Partial<EntityOptions>) => {
  let selected = false

  return new Entity({
    type: 'building',
    game,
    ...properties,

    update () {
      const { camera, input } = game
      const { position } = this
      selected = false

      if (game.turnPlayer?.npc ?? !position) {
        return
      }

      // Calculate mouse position
      const mouseTile = {
        x: Math.floor((input.mouse.x + camera.x) / Sprites.size),
        y: Math.floor((input.mouse.y + camera.y) / Sprites.size)
      }

      // Select building
      if ([position.x, position.x + 1].includes(mouseTile.x) && [position.y, position.y + 1].includes(mouseTile.y)) {
        selected = true
      }
    },

    draw () {
      const { camera, canvas } = game
      const { position, tile } = this
      const spriteSize = 16

      // Draw tile at position
      if (position && tile) {
        canvas.drawTile({
          x: Math.round(position.x * Sprites.size - camera.x),
          y: Math.round(position.y * Sprites.size - camera.y),
          width: spriteSize,
          height: spriteSize,
          tile
        })
      }

      if (position && selected) {
        canvas.drawTile({
          x: Math.round(position.x * Sprites.size - camera.x),
          y: Math.round(position.y * Sprites.size - camera.y),
          width: spriteSize,
          height: spriteSize,
          tile: 49
        })
      }

      if (position && this.owner) {
        canvas.drawTile({
          x: Math.round((position.x + 1) * Sprites.size - camera.x),
          y: Math.round((position.y + 1) * Sprites.size - camera.y),
          tile: Sprites.flags[1]
        })
      }
    },

    check (other) {
      if (other.type === 'player') {
        this.owner = other
      }
    }
  })
}

import { Entities } from './core/entities'
import { GameState } from './core/gameState'
import { type Game } from './game'
import Sprites from './sprites'
import { createStateGame } from './stateGame'

let stateTitleData = {
  elapsedTime: 0,
  default: {
    elapsedTime: 0
  }
}

export const createStateTitle = (game: Game) => {
  return new GameState({
    game,
    entities: new Entities({}),
    init: () => {
      stateTitleData = {
        ...stateTitleData.default,
        default: stateTitleData.default
      }
    },

    update: (dt) => {
      stateTitleData.elapsedTime += dt

      if (stateTitleData.elapsedTime > 3000 && game.input.keys.get(13)) {
        game.setState(createStateGame(game))
      }
    },

    draw: (dt) => {
      const { canvas, text } = game
      const { elapsedTime } = stateTitleData

      canvas.drawRect(
        0,
        0,
        canvas.canvas.width,
        canvas.canvas.height,
        '#000000'
      )

      if (elapsedTime < 4000) {
        const opacity = Math.min(1, elapsedTime / 1000)

        canvas.drawTile({
          x: canvas.canvas.width / 2 - Sprites.logo.size.x / 2,
          y: canvas.canvas.height / 2 - Sprites.logo.size.y / 2,
          tile: Sprites.logo.tile,
          width: Sprites.logo.size.x,
          height: Sprites.logo.size.y,
          alpha: opacity
        })
      }

      if (elapsedTime > 3000 && elapsedTime < 4000) {
        const opacity = Math.min(1, (elapsedTime - 3000) / 1000)
        canvas.drawRect(
          0,
          0,
          canvas.canvas.width,
          canvas.canvas.height,
        `rgba(0, 0, 0, ${opacity}`
        )
      }

      if (elapsedTime > 4000) {
        const opacity = Math.min(1, (elapsedTime - 4000) / 1000)
        canvas.drawRect(
          0,
          0,
          canvas.canvas.width,
          canvas.canvas.height,
        `rgba(0, 0, 0, ${opacity}`
        )
        canvas.drawTile({
          x: canvas.canvas.width / 2 - Sprites.title.size.x / 2,
          y: canvas.canvas.height / 2 - Sprites.title.size.y / 1.5,
          tile: Sprites.title.tile,
          width: Sprites.title.size.x,
          height: Sprites.title.size.y,
          alpha: opacity
        })
        text.draw({
          x: canvas.canvas.width / 2,
          y: canvas.canvas.height - 32,
          align: 'center',
          string: 'Press enter to start',
          color: '#ffffff',
          opacity
        })

        text.draw({
          x: canvas.canvas.width / 2,
          y: canvas.canvas.height - 16,
          align: 'center',
          string: 'Score: 000000',
          color: '#6f6e72',
          opacity
        })
      }
    }
  })
}

import { Entities } from './core/entities'
import { GameState } from './core/gameState'
import { Grid } from './core/level'
import { pathfind } from './core/pathfind'
import { Tween } from './core/tween'
import { Value2D } from './core/value2d'
import { createPlayer } from './entityPlayer'
import { type Game } from './game'
import Sprites from './sprites'

let stateGameData = {
  elapsedTime: 0,
  default: {
    elapsedTime: 0
  }
}

export const createStateGame = (game: Game) => {
  return new GameState({
    game,
    entities: new Entities({}),
    init: () => {
      stateGameData = {
        ...stateGameData.default,
        default: stateGameData.default
      }

      const { entities, fog, map, players } = game

      // Draw border around map
      map.grid.forEach((row, y) => {
        row.forEach((tile, x) => {
          if (x < 2 || y < 2 || x >= map.size - 2 || y >= map.size - 2) {
            map.grid[y][x] = 1
          }
        })
      })

      // Make space for 2x2 trees
      map.drawRandomBlocks(0.25)

      // Replace 2D sets of sprites
      map.replaceTiles(Sprites.terrain.tree)

      // Draw paths
      let attempts = 0
      let successfulPaths = 0
      while (attempts < 10 && successfulPaths < 30) {
        const position1 = map.getRandomPosition(null)
        const position2 = map.getRandomPosition(null)
        const possiblePath = pathfind(map.grid, position1, position2)

        if (possiblePath) {
          const roadType =
            Sprites.terrain.roads[
              Math.floor(Math.random() * Sprites.terrain.roads.length)
            ]
          possiblePath.forEach((p) => {
            map.tiles[p.y][p.x] = roadType
          })
          successfulPaths += 1
        }

        attempts += 1
      }

      map.tiles.forEach((row, y) => {
        row.forEach((tile, x) => {
          // 15% chance to replace with random item from Sprites.terrain.grass
          if (Math.random() > 0.85 && tile === 0) {
            map.tiles[y][x] =
              Sprites.terrain.grass[
                Math.floor(Math.random() * Sprites.terrain.grass.length)
              ]
          }
        })
      })

      // Init 4 Players
      for (let i = 0; i < 4; i++) {
        let position = null
        while (!position) {
          const possiblePosition = map.randomQuadPos(i + 1)
          if (map.grid[possiblePosition.y][possiblePosition.x] === 0) {
            position = possiblePosition
          }
        }
        const p = entities.add(createPlayer(game))

        p.npc = i > 0
        p.steps = p.npc ? 8 : 16
        p.tile = Sprites.characters[i]
        p.position = position

        p.tween = new Tween({
          duration: 0.25,
          startValue: {
            x: Math.round(p.position.x),
            y: Math.round(p.position.y)
          },
          endValue: {
            x: Math.round(p.position.x),
            y: Math.round(p.position.y)
          },
          callback: (tween) => {
            p.position.x = tween.x
            p.position.y = tween.y

            if (p.tween?.isFinished()) {
              p.position = {
                x: Math.round(p.position.x),
                y: Math.round(p.position.y)
              }
              fog.clearCircle(p.position.x, p.position.y, 8)
            }
          }
        })
        players[i] = p
      }
      game.player = players[0]

      game.turnStart()
    },

    update: (dt) => {
      const { camera, canvas, entities, map, player } = game
      const turnPlayer = game.turnPlayer

      stateGameData.elapsedTime += dt

      // Camera position
      if (turnPlayer) {
        camera.x = Math.round(
          turnPlayer.position.x * Sprites.size - canvas.canvas.width / 2
        )
        camera.y = Math.round(
          turnPlayer.position.y * Sprites.size - canvas.canvas.height / 2
        )
      }

      // Limit camera position to borders of the level
      camera.x = Math.max(
        0,
        Math.min(camera.x, map.size * Sprites.size - canvas.canvas.width)
      )
      camera.y = Math.max(
        0,
        Math.min(camera.y, map.size * Sprites.size - canvas.canvas.height)
      )

      // Limit player position to level borders
      if (player) {
        player.position.x = Math.max(
          0,
          Math.min(player.position.x, map.size - 1)
        )
        player.position.y = Math.max(
          0,
          Math.min(player.position.y, map.size - 1)
        )
      }

      entities.update()

      game.players.forEach((p) => {
        p.tween?.update(dt / 1000)
      })

      // Player input
      if (
        stateGameData.elapsedTime > 3000 &&
        game.input.keys.get(13) &&
        !turnPlayer?.npc
      ) {
        game.turnNext()
      }
    },

    draw: (dt) => {
      const { canvas, entities, input } = game

      canvas.clear()

      // Draw map
      game.drawMap()

      // Example: Draw a tile
      entities.draw()

      // Draw fog
      game.drawFog()

      // Draw mouse cursor
      canvas.drawTile({
        x: Math.floor(input.mouse.x),
        y: Math.floor(input.mouse.y),
        tile: Sprites.cursor[0]
      })

      // Clear mouse buttons
      input.mouse.button1 = null

      // UI
      const currentPlayer = game.turnPlayer
      if (!currentPlayer) return

      canvas.drawRect(
        0,
        game.canvas.canvas.height - 10,
        game.canvas.canvas.width,
        10,
        'rgb(31, 44, 60)'
      )
      game.text.draw({
        x: 4,
        y: game.canvas.canvas.height - 7,
        string: currentPlayer.npc
          ? 'The enemy is moving forward'
          : 'Press Enter to finish turn',
        color: '#ffffff'
      })

      if (!currentPlayer.npc) {
        game.text.draw({
          x: game.canvas.canvas.width - 4,
          y: game.canvas.canvas.height - 7,
          align: 'right',
          string: `Steps: ${currentPlayer.stepsRemaining}`,
          color: '#ffffff'
        })
      }
    }
  })
}

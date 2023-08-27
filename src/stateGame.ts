import { Entities } from './core/entities'
import { GameState } from './core/gameState'
import { pathfind } from './core/pathfind'
import { Tween } from './core/tween'
import { getRandomItem } from './core/utils'
import { type Value2D } from './core/value2d'
import { createBuilding } from './entityBuilding'
import { createPlayer } from './entityPlayer'
import { type Game } from './game'
import Sprites from './sprites'

let stateGameData = {
  elapsedTime: 0,
  default: {
    elapsedTime: 0
  }
}

const modal = {
  title: '',
  text: '',
  open: false
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

      const buildingPositions: Value2D[] = []
      for (let i = 0; i < 64; i++) {
        const pos = map.getRandom2x2EmptySpace()

        // Check if pos exist in buildingPositions
        if (!pos || buildingPositions.some((p) => {
          return [p.x - 1, p.x, p.x + 1].includes(pos.x) && [p.y - 1, p.y, p.y + 1].includes(pos.y)
        })) {
          continue
        }

        buildingPositions.push(pos)

        entities.add(
          createBuilding(game, {
            position: pos,
            tile: getRandomItem([
              Sprites.buildings.windmill,
              Sprites.buildings.tower,
              Sprites.buildings.house,
              Sprites.buildings.portal,
              Sprites.buildings.churchLarge,
              Sprites.buildings.churchSmall,
              Sprites.buildings.blacksmith,
              Sprites.buildings.camp,
              Sprites.buildings.volcano,
              Sprites.buildings.tavern,
              Sprites.buildings.waterfall,
              Sprites.buildings.castle,
              Sprites.buildings.structure,
              Sprites.buildings.potion,
              Sprites.buildings.farm,
              Sprites.buildings.cave
            ])
          })
        )
      }

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

      // Bottom
      canvas.drawRect(
        0,
        game.canvas.canvas.height - 7,
        game.canvas.canvas.width,
        7,
        'rgb(31, 44, 60, 0.8)'
      )
      game.text.draw({
        x: 2,
        y: game.canvas.canvas.height - 6,
        string: currentPlayer.npc
          ? 'The enemy is moving forward'
          : 'Press Enter to finish turn',
        color: '#ffffff'
      })

      // if (!currentPlayer.npc) {
      game.text.draw({
        x: game.canvas.canvas.width - 2,
        y: game.canvas.canvas.height - 6,
        align: 'right',
        string: `Steps: ${currentPlayer.stepsRemaining}`,
        color: '#ffffff'
      })
      // }

      // Top
      canvas.drawRect(
        0,
        0,
        game.canvas.canvas.width,
        7,
        'rgb(31, 44, 60, 0.8)'
      )

      game.text.draw({
        x: 2,
        y: 1,
        string: 'Day 1, Week 1',
        color: '#ffffff'
      })

      if (!currentPlayer.npc) {
        game.text.draw({
          x: game.canvas.canvas.width - 2,
          y: 1,
          string: `Pos: ${Math.round(currentPlayer.position.x)}, ${Math.round(currentPlayer.position.y)}`,
          color: '#ffffff',
          align: 'right'
        })
      }

      // Modal
      if (modal.open) {
        const modalPosition = { x: game.canvas.canvas.width / 4, y: game.canvas.canvas.height / 4 }
        const separator = '------------------- '

        canvas.drawRect(
          modalPosition.x,
          modalPosition.y,
          game.canvas.canvas.width / 2,
          game.canvas.canvas.height / 2,
          'rgb(31, 44, 60, 0.8)'
        )
        game.text.draw({
          x: modalPosition.x * 2,
          y: modalPosition.y + 1,
          string: 'You encounter',
          color: '#ffffff',
          align: 'center'
        })
        game.text.draw({
          x: modalPosition.x * 2,
          y: modalPosition.y + 8,
          string: 'a treasure chest',
          color: '#ffffff',
          align: 'center'
        })

        game.text.drawMultilineText({
          string: `${separator}This is a multiline text to test the new function`,
          width: 22,
          x: 108,
          y: 45,
          color: '#ffffff'
        })
      }
    }
  })
}

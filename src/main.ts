import './style.css'

import { Loop } from './core/loop'
import { Tween } from './core/tween'
import { createPlayer } from './entityPlayer'
import { Game } from './game'

const game = new Game({
  size: 64,
  density: 0.65,

  init: () => {
    const { entities, fog, map, players } = game

    // Init 4 Players
    for (let i = 0; i < 4; i++) {
      const position = map.randomQuadPos(i + 1)
      const p = entities.add(createPlayer(game))

      const sprites = [9, 30, 31, 38]

      p.npc = i > 0
      p.tile = sprites[i]
      p.position = position

      // Destroy around
      map.destroy(p.position)

      p.tween = new Tween({
        duration: 0.25,
        startValue: {
          x: Math.round(p.position.x),
          y: Math.round(p.position.y)
        },
        endValue: { x: Math.round(p.position.x), y: Math.round(p.position.y) },
        callback: (tween) => {
          p.position.x = tween.x
          p.position.y = tween.y

          if (p.tween?.isFinished()) {
            p.position = {
              x: Math.round(p.position.x),
              y: Math.round(p.position.y)
            }
            fog.clearCircle(p.position.y, p.position.x, 8)
          }
        }
      })
      players[i] = p
    }
    game.player = players[0]
  },

  update (delta) {
    const { camera, canvas, entities, input, map, player } = game

    // Prevent drawing if canvas is not ready
    if (!canvas.ready || !player) return

    // Camera position
    const turnPlayer = game.turnPlayer
    if (turnPlayer) {
      camera.x = Math.round(
        turnPlayer.position.x * 16 - canvas.canvas.width / 2
      )
      camera.y = Math.round(
        turnPlayer.position.y * 16 - canvas.canvas.height / 2
      )
    }

    // Limit camera position to borders of the level
    camera.x = Math.max(
      0,
      Math.min(camera.x, map.size * 16 - canvas.canvas.width)
    )
    camera.y = Math.max(
      0,
      Math.min(camera.y, map.size * 16 - canvas.canvas.height)
    )

    // Limit player position to level borders
    player.position.x = Math.max(0, Math.min(player.position.x, map.size - 1))
    player.position.y = Math.max(0, Math.min(player.position.y, map.size - 1))

    entities.update()

    game.players.forEach((p) => {
      p.tween?.update(delta / 1000)
    })
  },

  draw () {
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
      tile: 16
    })

    // Clear mouse buttons
    input.mouse.button1 = null

    // UI
    const currentPlayer = game.turnPlayer
    if (!currentPlayer) return

    canvas.drawRect(
      0,
      game.canvas.canvas.height - 18,
      game.canvas.canvas.width,
      18,
      'rgb(31, 44, 60)'
    )
    canvas.drawText({
      x: 4,
      y: game.canvas.canvas.height - 14,
      text: currentPlayer.npc
        ? 'The enemy is moving forward'
        : 'Press Enter to finish your turn',
      color: 'rgb(243, 232, 223)'
    })
    canvas.drawText({
      x: game.canvas.canvas.width - 4,
      y: game.canvas.canvas.height - 14,
      text: `Steps remaining: ${currentPlayer.stepsRemaining}`,
      align: 'right',
      color: 'rgb(243, 232, 223)'
    })
  }
})

const loop = new Loop((delta) => {
  game.update(delta)
  game.draw(delta)
})

game.init()
game.turnStart()
loop.start()

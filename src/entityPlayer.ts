import { Entity } from './core/entity'
import { pathfind } from './core/pathfind'
import { type Value2D } from './core/value2d'
import { type Game } from './game'

// Move player along path
const movePath = (entity: Partial<Entity>) => {
  const { position, tween } = entity

  entity.stepsRemaining = entity.stepsRemaining ?? 0
  if (
    entity.stepsRemaining > 0 &&
    entity.path &&
    tween?.isFinished() &&
    position
  ) {
    if (entity.pathIndex === undefined) return

    tween.reset({
      startValue: { ...position },
      endValue: entity.path[entity.pathIndex],
      onComplete: () => {
        console.log('Tween complete')
      }
    })

    entity.flipX = position.x && entity.path[entity.pathIndex].x
      ? entity.path[entity.pathIndex].x < position.x
      : false
    entity.pathIndex += 1
    entity.stepsRemaining -= 1

    if (entity.pathIndex >= entity.path.length) {
      entity.path = null
    }
  }
}

export const createPlayer = (game: Game) => {
  let mousePath: Value2D[] | null = null

  return new Entity({
    game,
    update () {
      const { camera, input, map } = game
      const { id, position, tween } = this
      this.stepsRemaining = this.stepsRemaining ?? 0

      if (game?.turnPlayer?.id !== id) return

      // Move player along path
      movePath(this)

      // NPC AI
      if (this.npc) {
        // Turn finished
        if (this.stepsRemaining <= 0) {
          game.turnNext()
          return
        }

        // Find a new random path
        const maxAttempts = 10
        let attemptCount = 0
        let newPath: Value2D[] | null = null
        while (
          !this.path &&
          (!newPath || newPath?.length === 0) &&
          attemptCount < maxAttempts
        ) {
          console.log('attempting to find a path')
          const possiblePosition = game.map.randomQuadPos(1)
          if (position) {
            newPath = pathfind(game.map.grid, position, possiblePosition)
          }
          attemptCount++
        }

        if (attemptCount === maxAttempts) {
          console.warn('Failed to find a path after maximum attempts.')
          game.turnNext()
        }

        if (newPath) {
          this.path = newPath.slice(1, this.stepsRemaining + 1)
          this.pathIndex = 0
          console.log('cpu has a path', newPath)
        }
      }

      // Only human code from this point on
      if (this.npc) return

      // Calculate mouse position
      const mouseTile = {
        x: Math.floor((input.mouse.x + camera.x) / 16),
        y: Math.floor((input.mouse.y + camera.y) / 16)
      }

      // Calculate path to mouse
      mousePath = null
      if (position && tween?.isFinished()) {
        mousePath = pathfind(map.grid, position, mouseTile)
      }

      if (input.mouse.button1 && mousePath && mousePath.length > 0) {
        console.log('define path', mousePath)
        this.path = mousePath.slice(1, this.stepsRemaining + 1)
        this.pathIndex = 0
      }

      // Player input
      if (input.keys.get(13)) {
        game.turnNext()
      }
    },

    draw () {
      const { camera, canvas } = game
      const { position, tile } = this

      // Draw tile at position
      if (position && tile) {
        canvas.drawTile({
          x: Math.round(position.x * 16 - camera.x),
          y: Math.round(position.y * 16 - camera.y),
          tile,
          flipX: this.flipX
        })
      }

      // Draw mouse path
      if (mousePath && tile) {
        mousePath.slice(1, (this?.stepsRemaining ?? 0) + 1).forEach((p, i) => {
          const x = Math.round(p.x * 16 - camera.x)
          const y = Math.round(p.y * 16 - camera.y)
          canvas.drawTile({
            x,
            y,
            tile,
            alpha: 0.4,
            flipX: this.flipX
          })
        })
      }
    }
  })
}

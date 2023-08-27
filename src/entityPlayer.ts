import { Entity } from './core/entity'
import { pathfind } from './core/pathfind'
import { getRandomItem } from './core/utils'
import { type Value2D } from './core/value2d'
import { type Game } from './game'
import Sprites from './sprites'

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
    if (entity.pathIndex === undefined || !entity.path[entity.pathIndex]) {
      return
    }

    tween.reset({
      startValue: position,
      endValue: entity.path[entity.pathIndex],
      onComplete: () => {
        entity.path = null
      }
    })

    entity.flipX =
      position.x && entity.path[entity.pathIndex].x
        ? entity.path[entity.pathIndex].x < position.x
        : false
    entity.pathIndex += 1
    entity.stepsRemaining -= 1

    if (entity.pathIndex >= entity.path.length) {
      entity.path = null
    }
  }
}

// Find closest entity to position
const findClosestEntity = (
  entities: Entity[],
  position: Value2D
): Entity | null => {
  let closestEntity: Entity | null = null
  let closestDistance: number = Infinity
  entities.forEach((entity) => {
    const distance = Math.sqrt(
      (position.x - entity.position.x) ** 2 +
        (position.y - entity.position.y) ** 2
    )
    if (distance < closestDistance) {
      closestEntity = entity
      closestDistance = distance
    }
  })
  return closestEntity
}

export const createPlayer = (game: Game) => {
  let mousePath: Value2D[] | null = null

  return new Entity({
    game,
    type: 'player',
    update () {
      const { camera, input, map } = game
      const { id, position, tween } = this
      this.stepsRemaining = this.stepsRemaining ?? 0

      if (game?.turnPlayer?.id !== id) return

      // Move player along path
      movePath(this)

      if (!this.path || this.path.length === 0) {
        // Check if is over a building
        const entity = game.entities.list.find((e: Entity) => {
          return (
            e.id !== id &&
            [e.position.x, e.position.x + 1].includes(position?.x ?? 0) &&
            [e.position.y, e.position.y + 1].includes(position?.y ?? 0) &&
            e.owner?.id !== id
          )
        })
        if (entity) {
          entity.check(this)
          return
        }
      }

      // Moving, dont bother
      if ((this.path && this.path.length > 0) ?? !tween?.disabled) { return }

      // NPC AI
      if (this.npc) {
        // Turn finished
        if (this.stepsRemaining <= 0) {
          game.turnNext()
          return
        }

        if (!position || (this.path && this.path?.length > 0)) return

        const closestEntity = findClosestEntity(
          game.entities.list.filter((e) => e.id !== id && e.position.x !== position.x && e.position.y !== position.y && e.owner?.id !== id),
          position
        )

        if (closestEntity) {
          const newPathToEntity: Value2D[] | null = position
            ? pathfind(game.map.grid, position, closestEntity.position)
            : null

          if (
            newPathToEntity &&
            newPathToEntity.length <= this.stepsRemaining + 1
          ) {
            this.path = newPathToEntity.slice(1, this.stepsRemaining + 1)
            this.pathIndex = 0
            console.log('cpu has a path to entity', newPathToEntity)
            return // Exit the update function since a path has been found
          }
        }

        // If couldn't find a path to the entity or not enough stepsRemaining, try random positions
        let attemptCount = 0
        const maxAttempts = 32
        let newPath: Value2D[] | null = null
        while (
          !this.path &&
          (!newPath ||
            newPath?.length === 0) && // ||
          // newPath.length > this.stepsRemaining + 1) && // Check if newPath fits within stepsRemaining
          attemptCount < maxAttempts
        ) {
          console.log('attempting to find a random path')
          const empty = game.map.findAll1x1EmptySpaces()
          const possiblePosition = getRandomItem(empty)
          if (position) {
            newPath = pathfind(game.map.grid, position, possiblePosition)
            console.log('trying', possiblePosition, 'from', position, 'result', newPath)
          }
          attemptCount++
        }

        if (attemptCount === maxAttempts) {
          console.warn('Stuck')
          game.turnNext()
        } else if (newPath) {
          this.path = newPath.slice(1, this.stepsRemaining + 1)
          this.pathIndex = 0
          console.log('cpu has a random path', newPath)
        }

        if (this.path?.length === 0) {
          this.path = null
        }
      }

      // Only human code from this point on
      if (this.npc) return

      // Calculate mouse position
      const mouseTile = {
        x: Math.floor((input.mouse.x + camera.x) / Sprites.size),
        y: Math.floor((input.mouse.y + camera.y) / Sprites.size)
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
    },

    draw () {
      const { camera, canvas } = game
      const { position, tile } = this

      // Draw tile at position
      if (position && tile) {
        canvas.drawTile({
          x: Math.round(position.x * Sprites.size - camera.x),
          y: Math.round(position.y * Sprites.size - camera.y),
          tile,
          flipX: this.flipX,
          shadow: true
        })
      }

      // Draw mouse path
      if (mousePath && tile) {
        mousePath.slice(1, (this?.stepsRemaining ?? 0) + 1).forEach((p, i) => {
          const x = Math.round(p.x * Sprites.size - camera.x)
          const y = Math.round(p.y * Sprites.size - camera.y)
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

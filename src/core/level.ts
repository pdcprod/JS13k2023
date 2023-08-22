import { type Value2D } from './value2d'

type Grid = number[][]

const neighbors: Value2D[] = [
  { x: -1, y: -1 },
  { x: -1, y: 0 },
  { x: -1, y: 1 },
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: 1, y: -1 },
  { x: 1, y: 0 },
  { x: 1, y: 1 }
]

export class Level {
  grid: Grid
  tiles: Grid
  size: number
  density: number

  constructor (size: number = 32, density: number = 0.5) {
    this.size = size
    this.density = density
    this.grid = this.init()
    this.tiles = structuredClone(this.grid)
    this.generate(this.grid)
  }

  // Create grid with random values
  private init (): Grid {
    const { density, size } = this
    const grid: Grid = []
    for (let i = 0; i < size; i += 1) {
      grid[i] = []
      for (let j = 0; j < size; j += 1) {
        grid[i][j] = Math.random() > density ? 1 : 0
      }
    }
    return grid
  }

  // Obtain the majority of neighbors
  private neighbors (grid: Grid, x: number, y: number): number {
    const { size } = this
    const sum: number = neighbors.reduce((acc, { x: dx, y: dy }) => {
      const nx = x + dx
      const ny = y + dy
      if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
        return acc + grid[nx][ny]
      }
      return acc
    }, 0)

    // Rule of the majority
    return sum > 4 ? 1 : 0
  }

  // Next automata generation
  generate (grid: Grid): Grid {
    const { size } = this
    const newGrid: Grid = []
    for (let i = 0; i < size; i += 1) {
      newGrid[i] = []
      for (let j = 0; j < size; j += 1) {
        newGrid[i][j] = this.neighbors(grid, i, j)
      }
    }
    return newGrid
  }

  randomQuadPos (quadrant: number): Value2D {
    if (quadrant < 1 || quadrant > 4) {
      throw new Error('Invalid quadrant number. Must be between 1 and 4.')
    }

    const halfSize: number = this.size / 2
    const startX: number = quadrant === 1 || quadrant === 3 ? 0 : halfSize
    const startY: number = quadrant === 1 || quadrant === 2 ? 0 : halfSize

    return {
      x: startX + Math.floor(Math.random() * halfSize),
      y: startY + Math.floor(Math.random() * halfSize)
    }
  }

  // Destroy blocks in and around the position
  destroy (position: Value2D): void {
    const { size, grid, tiles } = this
    const { x, y } = position
    grid[x][y] = 0
    tiles[x][y] = 0
    neighbors.forEach(({ x: dx, y: dy }) => {
      const nx = x + dx
      const ny = y + dy
      if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
        grid[nx][ny] = 0
        tiles[nx][ny] = 0
      }
    })
  }

  private isBlockAllOnes (matrix: number[][], i: number, j: number, width: number, height: number): boolean {
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (matrix[i + y][j + x] !== 1) {
          return false
        }
      }
    }
    return true
  }

  private replaceBlock (matrix: number[][], i: number, j: number, replacement: number[][]): void {
    const width = replacement[0].length
    const height = replacement.length

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        matrix[i + y][j + x] = replacement[x]?.[y]
      }
    }
  }

  replaceTiles (replacements: number[][][]): void {
    let replacement = replacements[Math.floor(Math.random() * replacements.length)]
    const width = replacement[0].length
    const height = replacement.length
    const matrix = this.tiles

    for (let i = 0; i <= matrix.length - height; i++) {
      for (let j = 0; j <= matrix[i].length - width; j++) {
        if (this.isBlockAllOnes(matrix, i, j, width, height)) {
          replacement = replacements[Math.floor(Math.random() * replacements.length)]
          this.replaceBlock(matrix, i, j, replacement)
        }
      }
    }

    this.tiles = matrix
  }
}

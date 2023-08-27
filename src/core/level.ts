import { type Value2D } from './value2d'

export type Grid = number[][]

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

  constructor (size: number = 32) {
    this.size = size
    this.grid = this.init()
    this.tiles = this.grid.map((row) => [...row])
    this.generate(this.grid)
  }

  // Create grid with random values
  private init (): Grid {
    const { size } = this
    const grid: Grid = []
    for (let y = 0; y < size; y += 1) {
      grid[y] = []
      for (let x = 0; x < size; x += 1) {
        grid[y][x] = 0
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
    const newGrid: Grid = []

    grid.forEach((row, y) => {
      newGrid[y] = []
      row.forEach((v, x) => {
        newGrid[y][x] = this.neighbors(grid, x, y)
      })
    })

    return newGrid
  }

  // Obtain a random position inside a quadrant
  randomQuadPos (quadrant: number): Value2D {
    if (quadrant < 1 || quadrant > 4) {
      throw new Error()
    }

    const halfSize = this.size / 2
    return {
      x:
        (quadrant === 1 || quadrant === 3 ? 0 : halfSize) +
        Math.floor(Math.random() * halfSize),
      y: (quadrant <= 2 ? 0 : halfSize) + Math.floor(Math.random() * halfSize)
    }
  }

  getRandomPosition (quadrant: number | null) {
    let position: Value2D | null = null
    while (!position) {
      const possiblePosition = this.randomQuadPos(
        quadrant ?? Math.floor(Math.random() * 4) + 1
      )
      if (this.grid[possiblePosition.y][possiblePosition.x] === 0) {
        position = possiblePosition
      }
    }
    return position
  }

  // Destroy blocks in and around the position
  destroy (position: Value2D): void {
    const { size, grid, tiles } = this
    const { x, y } = position
    grid[y][x] = 0
    tiles[y][x] = 0
    neighbors.forEach(({ x: dx, y: dy }) => {
      const nx = x + dx
      const ny = y + dy
      if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
        grid[ny][nx] = 0
        tiles[ny][nx] = 0
      }
    })
  }

  // Check if a block is all ones
  private isBlockAllOnes (
    grid: number[][],
    y: number,
    x: number,
    height: number,
    width: number
  ): boolean {
    for (let iy = 0; iy < height; iy++) {
      for (let ix = 0; ix < width; ix++) {
        if (grid[y + iy][x + ix] !== 1) {
          return false
        }
      }
    }

    return true
  }

  // Replace a block with a replacement
  private replaceBlock (
    grid: number[][],
    y: number,
    x: number,
    replacement: number[][]
  ): void {
    const height = replacement.length
    const width = replacement[0].length

    for (let iy = 0; iy < height; iy++) {
      for (let ix = 0; ix < width; ix++) {
        grid[y + iy][x + ix] = replacement[iy]?.[ix]
      }
    }
  }

  // Replace tiles with replacements
  replaceTiles (replacements: number[][][]): void {
    let replacement =
      replacements[Math.floor(Math.random() * replacements.length)]
    const height = replacement.length
    const width = replacement[0].length
    const grid = this.tiles

    for (let y = 0; y <= grid.length - height; y++) {
      for (let x = 0; x <= grid[y].length - width; x++) {
        if (this.isBlockAllOnes(grid, y, x, height, width)) {
          replacement =
            replacements[Math.floor(Math.random() * replacements.length)]
          this.replaceBlock(grid, y, x, replacement)
        }
      }
    }

    // Update grid with new tiles
    this.grid.forEach((row, i) => {
      row.forEach((_, j) => {
        this.grid[i][j] = this.tiles[i][j] > 0 ? 1 : 0
      })
    })

    this.tiles = grid
  }

  drawRandomBlocks (density: number): void {
    const { grid } = this
    const size = this.grid.length
    // 2x2 block
    const totalBlocks = Math.floor((size * size * density) / 4)

    for (let i = 0; i < totalBlocks; i++) {
      let x = 0
      let y = 0
      let isSpaceAvailable = false

      // Check if there is space for a 2x2 block
      while (!isSpaceAvailable) {
        // -1 because we need to have space for the 2x2 block
        x = Math.floor(Math.random() * (size - 1))
        y = Math.floor(Math.random() * (size - 1))

        if (
          grid[y][x] === 0 &&
          grid[y + 1][x] === 0 &&
          grid[y][x + 1] === 0 &&
          grid[y + 1][x + 1] === 0
        ) {
          isSpaceAvailable = true

          this.grid[y][x] = 1
          this.grid[y + 1][x] = 1
          this.grid[y][x + 1] = 1
          this.grid[y + 1][x + 1] = 1
        }
      }
    }

    this.tiles = this.grid.map((row) => [...row])
  }

  findAll1x1EmptySpaces (): Value2D[] {
    const { grid } = this
    const spaces: Value2D[] = []
    const rows = grid.length
    const cols = grid[0].length

    for (let y = 0; y < rows - 1; y++) {
      for (let x = 0; x < cols - 1; x++) {
        if (grid[y][x] === 0) {
          spaces.push({ x, y })
        }
      }
    }

    return spaces
  }

  findAll2x2EmptySpaces (): Value2D[] {
    const { grid } = this
    const spaces: Value2D[] = []
    const rows = grid.length
    const cols = grid[0].length

    for (let y = 0; y < rows - 1; y++) {
      for (let x = 0; x < cols - 1; x++) {
        if (
          grid[y][x] === 0 &&
          grid[y + 1][x] === 0 &&
          grid[y][x + 1] === 0 &&
          grid[y + 1][x + 1] === 0
        ) {
          spaces.push({ x, y })
        }
      }
    }

    return spaces
  }

  getRandom2x2EmptySpace (): Value2D | null {
    const spaces = this.findAll2x2EmptySpaces()
    if (spaces.length === 0) return null
    return spaces[Math.floor(Math.random() * spaces.length)]
  }
}

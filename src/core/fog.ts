export class Fog {
  size: number
  grid: number[][]

  constructor (size: number) {
    this.size = size
    this.grid = this.initializeGrid()
  }

  // Initialize a 2D array with value 1
  private initializeGrid (): number[][] {
    const { size } = this
    return Array.from({ length: size }, () => Array(size).fill(1))
  }

  // Check if a point is inside a circle
  private isInsideCircle (
    cx: number,
    cy: number,
    r: number,
    x: number,
    y: number
  ): boolean {
    const dx = cx - x
    const dy = cy - y
    return dx * dx + dy * dy <= r * r
  }

  // Check if a point is on the border of a circle
  private isOnCircleBorder (
    cx: number,
    cy: number,
    r: number,
    x: number,
    y: number
  ): boolean {
    const dx = cx - x
    const dy = cy - y
    const distance = dx * dx + dy * dy
    return (
      distance >= (r - 0.5) * (r - 0.5) && distance <= (r + 0.5) * (r + 0.5)
    )
  }

  // Convert all 1s to 0s within a circle's radius in the grid and set the border cells to 0.5
  public clearCircle (x: number, y: number, radius: number): void {
    for (let i = 0; i < this.grid.length; i += 1) {
      for (let j = 0; j < this.grid[i].length; j += 1) {
        if (this.grid[i][j] !== 0) {
          if (this.isOnCircleBorder(x, y, radius, j, i)) {
            this.grid[i][j] = 0.5
          } else if (this.isInsideCircle(x, y, radius, j, i)) {
            this.grid[i][j] = 0
          }
        }
      }
    }
  }
}

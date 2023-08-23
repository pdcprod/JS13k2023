import { type Value2D } from './value2d'

interface Node { val: Value2D, priority: number }

class PriorityQueue {
  private readonly values: Node[]

  constructor () {
    this.values = []
  }

  enqueue (val: Value2D, priority: number): void {
    this.values.push({ val, priority })
    this.sort()
  }

  dequeue (): Node | undefined {
    return this.values.shift()
  }

  private sort (): void {
    this.values.sort((a, b) => a.priority - b.priority)
  }

  isEmpty (): boolean {
    return this.values.length === 0
  }
}

// dijkstra algorithm
export function pathfind (
  grid: number[][],
  start: Value2D,
  end: Value2D
): Value2D[] | null {
  const rows = grid.length
  const cols = grid[0].length
  const pq = new PriorityQueue()

  if (grid[start.y][start.x] !== 0 || grid[end.y][end.x] !== 0) {
    return null
  }

  const distances: number[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(Infinity))
  const prev: Array<Array<Value2D | null>> = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null))
  distances[start.y][start.x] = 0

  pq.enqueue(start, 0)

  const dirs: Value2D[] = [
    { x: 0, y: 1 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: -1, y: 0 }
  ]

  while (!pq.isEmpty()) {
    let current: Value2D | null = pq.dequeue()?.val ?? null
    if (!current) return null
    const { x, y } = current

    if (x === end.x && y === end.y) {
      // Construct the path
      const path: Value2D[] = []
      while (current) {
        path.push(current)
        current = prev[current.y][current.x]
      }
      return path.reverse()
    }

    for (const dir of dirs) {
      const newX = x + dir.x
      const newY = y + dir.y

      if (
        newY >= 0 &&
        newY < rows &&
        newX >= 0 &&
        newX < cols &&
        grid[newY][newX] === 0
      ) {
        const newDist = distances[y][x] + 1
        if (newDist < distances[newY][newX]) {
          distances[newY][newX] = newDist
          prev[newY][newX] = { x, y }
          pq.enqueue({ x: newX, y: newY }, newDist)
        }
      }
    }
  }

  return null
}

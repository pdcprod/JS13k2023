import { type Canvas } from './canvas'

const defaultLetters = {
  a: [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
  b: [1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
  c: [0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1],
  d: [1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1],
  e: [1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1],
  f: [1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0],
  g: [0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1],
  h: [1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
  i: [1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1],
  j: [1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0],
  k: [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  l: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1],
  m: [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
  n: [1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
  o: [0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0],
  p: [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0],
  q: [0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1],
  r: [1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  s: [0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
  t: [1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
  u: [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1],
  v: [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0],
  w: [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  x: [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
  y: [1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
  z: [1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1],
  0: [1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1],
  1: [1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1],
  2: [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
  3: [1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1],
  4: [1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1],
  5: [1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1],
  6: [1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1],
  7: [1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
  8: [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
  9: [1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1],
  '!': [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
  '"': [1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  '#': [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  '%': [1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1],
  "'": [0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  '(': [0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
  ')': [0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0],
  '*': [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  '+': [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0],
  ',': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0],
  '-': [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  '.': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  '/': [0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
  ':': [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  '<': [0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  '>': [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0],
  '=': [0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0],
  '?': [1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0],
  '[': [1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0],
  ']': [0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1],
  '^': [0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  '~': [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  ' ': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  $: [0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0]
}

export class Text {
  private readonly canvas: Canvas
  private readonly letters: Record<string, number[]>

  constructor ({
    canvas,
    letters
  }: {
    canvas: Canvas
    letters?: Record<string, number[]>
  }) {
    this.canvas = canvas
    this.letters = defaultLetters
  }

  public draw ({
    string,
    x,
    y,
    color,
    align = 'left',
    size = 1,
    opacity = 1
  }: {
    string: string
    x: number
    y: number
    color: string
    align?: 'left' | 'center' | 'right'
    size?: number
    opacity?: number
  }): void {
    string = string.toLowerCase()
    const charWidth = 3 * size + size
    const charHeight = 5 * size
    let startX = x
    const rgba = this.canvas.hexToRGBA(color, opacity)

    if (align === 'center') {
      const totalWidth = string.length * charWidth
      startX = x - totalWidth / 2
    } else if (align === 'right') {
      const totalWidth = string.length * charWidth
      startX = x - totalWidth
    }

    for (const element of string) {
      const character = element.toLowerCase()
      const pattern = this.letters[character]

      if (!pattern) continue // Skip unrecognized characters.

      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 3; col++) {
          if (pattern[row * 3 + col] === 1) {
            this.canvas.drawPixel(
              startX + col * size,
              y + row * size,
              rgba[0],
              rgba[1],
              rgba[2],
              rgba[3]
            )
          }
        }
      }

      startX += charWidth // Move to the start of the next character.
    }
  }

  // Add this method
  drawMultilineText ({ string, width, x, y, color }: {
    string: string
    width: number
    x: number
    y: number
    color: string
  }) {
    const words = string.split(' ')
    let currentLine = ''
    let lineY = 0

    for (const word of words) {
      if ((currentLine + word).length > width) {
        this.draw({
          string: currentLine,
          x,
          y: y + lineY,
          color: '#ffffff',
          align: 'center'
        })
        currentLine = word + ' '
        lineY += 7
      } else {
        currentLine += word + ' '
      }
    }

    // Draw the last accumulated line if any.
    if (currentLine.trim().length) {
      this.draw({
        string: currentLine,
        x,
        y: y + lineY,
        color: '#ffffff',
        align: 'center'
      })
    }
  }
}

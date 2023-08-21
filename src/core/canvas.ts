import { type Value2D } from './value2d'

export class Canvas {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  sprites: HTMLImageElement
  ready = false
  offset: Value2D = { x: 0, y: 0 }
  tileSize: Value2D = { x: 16, y: 16 }

  constructor (canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.context = canvas.getContext('2d') as CanvasRenderingContext2D
    this.sprites = new Image()
    this.sprites.src = 'spritesheet.png'
    this.sprites.onload = () => {
      this.ready = true
    }
  }

  // Clear the canvas
  clear (): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  // Draw a rectangle on the canvas
  drawRect (
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ): void {
    const ctx = this.context
    ctx.fillStyle = color
    ctx.fillRect(x, y, width, height)
  }

  // Draw a section of an image (like a sprite) on the canvas
  drawImageRect (params: {
    sx: number
    sy: number
    sw: number
    sh: number
    dx: number
    dy: number
    dw: number
    dh: number
  }): void {
    this.context.drawImage(
      this.sprites,
      params.sx,
      params.sy,
      params.sw,
      params.sh,
      params.dx,
      params.dy,
      params.dw,
      params.dh
    )
  }

  // Draw a tile, potentially with effects like flip or rotate
  drawTile (params: {
    x: number
    y: number
    tile: number
    height?: number
    width?: number
    flipX?: boolean
    flipY?: boolean
    angle?: number
    alpha?: number
  }): void {
    const { context, sprites, tileSize } = this
    const {
      x,
      y,
      tile,
      height = tileSize.x,
      width = tileSize.y,
      flipX = false,
      flipY = false,
      angle = 0,
      alpha = 1
    } = params

    const flip = { x: flipX ? -1 : 1, y: flipY ? -1 : 1 }
    const rotationCenter = { x: x + width / 2, y: y + height / 2 }

    context.globalAlpha = alpha
    if (flipX || flipY || angle) {
      context.save()
      context.translate(rotationCenter.x, rotationCenter.y)
      context.scale(flip.x, flip.y)
      if (angle) context.rotate(angle)
      context.translate(-rotationCenter.x, -rotationCenter.y)
    }

    const tileX = ((tile - 1) * width) % sprites.width
    const tileY = Math.floor(((tile - 1) * width) / sprites.width) * height
    if (tileX >= 0 && tileY >= 0) {
      this.drawImageRect({
        sx: tileX,
        sy: tileY,
        sw: width,
        sh: height,
        dx: x,
        dy: y,
        dw: width,
        dh: height
      })
    }

    if (flipX || flipY || angle) context.restore()
    context.globalAlpha = 1
  }

  // Draw text on the canvas
  drawText (params: {
    x: number
    y: number
    text: string
    color?: string
    font?: string
    align?: CanvasTextAlign
    baseline?: CanvasTextBaseline
    alpha?: number
  }): void {
    const { context } = this
    const {
      x,
      y,
      text,
      color = 'white',
      font = '12px sans-serif',
      align = 'left',
      baseline = 'top',
      alpha = 1
    } = params

    context.globalAlpha = alpha
    context.fillStyle = color
    context.font = font
    context.textAlign = align
    context.textBaseline = baseline
    context.fillText(text, x, y)
    context.globalAlpha = 1
  }
}

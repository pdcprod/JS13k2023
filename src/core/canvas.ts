import { type Value2D } from './value2d'
import Sprites from '../sprites'

export class Canvas {
  canvas: HTMLCanvasElement
  canvasTemp: HTMLCanvasElement
  context: CanvasRenderingContext2D
  sprites: HTMLImageElement
  ready = false
  offset: Value2D = { x: 0, y: 0 }
  tileSize: Value2D = { x: Sprites.size, y: Sprites.size }

  constructor (canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.context = canvas.getContext('2d') as CanvasRenderingContext2D
    this.canvasTemp = document.createElement('canvas')
    this.sprites = new Image()
    this.sprites.src = 'spritesheet.png'
    this.sprites.onload = () => {
      this.ready = true
    }
  }

  // Clear the canvas
  clear (): void {
    this.drawRect(0, 0, this.canvas.width, this.canvas.height, '#7e9432')
  }

  // Convert hex color to RGBA
  hexToRGBA (hex: string, alpha = 1) {
    const bigint = parseInt(hex.slice(1), 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return [r, g, b, alpha]
  }

  // Draw a single pixel
  drawPixel (
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a?: number
  ): void {
    const id = this.context.createImageData(1, 1)
    const d = id.data
    d[0] = r
    d[1] = g
    d[2] = b
    d[3] = Math.round((a ?? 1) * 255)
    this.context.putImageData(id, x, y)
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
    shadow?: boolean
  }): void {
    const { canvasTemp, context, sprites, tileSize } = this
    const {
      x,
      y,
      tile,
      height = tileSize.x,
      width = tileSize.y,
      flipX = false,
      flipY = false,
      angle = 0,
      alpha = 1,
      shadow = false
    } = params

    const flip = { x: flipX ? -1 : 1, y: flipY ? -1 : 1 }
    const rotationCenter = { x: x + width / 2, y: y + height / 2 }

    const tileX = ((tile - 1) * width) % sprites.width
    const tileY = Math.floor(((tile - 1) * width) / sprites.width) * height

    if (!(tileX >= 0 && tileY >= 0)) return

    if (shadow) {
      canvasTemp.width = width
      canvasTemp.height = height
      const tempCtx = canvasTemp.getContext('2d')
      if (!tempCtx) return

      tempCtx.drawImage(
        sprites,
        tileX,
        tileY,
        width,
        height,
        0,
        0,
        width,
        height
      )
      tempCtx.fillStyle = 'black'
      tempCtx.globalCompositeOperation = 'source-in'
      tempCtx.fillRect(0, 0, width, height)

      const v = 0.5
      const offsets = [
        { dx: -v, dy: -v },
        { dx: v, dy: -v },
        { dx: -v, dy: 0 },
        { dx: v, dy: 0 },
        { dx: -v, dy: v },
        { dx: v, dy: v }
      ]

      for (const offset of offsets) {
        context.drawImage(canvasTemp, x + offset.dx, y + offset.dy)
      }
    }

    context.globalAlpha = alpha

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

    if (flipX || flipY || angle) {
      context.save()
      context.translate(rotationCenter.x, rotationCenter.y)
      context.scale(flip.x, flip.y)
      if (angle) context.rotate(angle)
      context.translate(-rotationCenter.x, -rotationCenter.y)
      context.restore()
    }

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

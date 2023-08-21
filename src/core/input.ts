import { type Value2D } from './value2d'

export class Input {
  private readonly canvas: HTMLCanvasElement

  public keys = new Map<number, number>()
  public mouse: {
    x: number
    y: number
    button1: Value2D | null
  } = {
      x: 0,
      y: 0,
      button1: null
    }

  constructor (canvas: HTMLCanvasElement) {
    this.canvas = canvas
    window.addEventListener('keydown', this.handleKey.bind(this, true))
    window.addEventListener('keyup', this.handleKey.bind(this, false))
    canvas.addEventListener('click', this.handleClick.bind(this))
    canvas.addEventListener(
      'mousemove',
      this.handleMouseMove.bind(this),
      false
    )
  }

  private handleKey (isKeyDown: boolean, event: KeyboardEvent) {
    this.keys.set(event.which, isKeyDown ? 1 : 0)
  }

  private handleClick (e: MouseEvent) {
    this.mouse.button1 = {
      x: e.pageX,
      y: e.pageY
    }
  }

  private handleMouseMove (e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect()
    const scaleX = this.canvas.width / rect.width
    const scaleY = this.canvas.height / rect.height

    // Aquí se ajustan las coordenadas en base a los estilos y la escala
    this.mouse.x = Math.round((e.clientX - rect.left) * scaleX)
    this.mouse.y = Math.round((e.clientY - rect.top) * scaleY)
  }

  public isKeyPressed (keyCode: number): boolean {
    return !!this.keys.get(keyCode)
  }
}

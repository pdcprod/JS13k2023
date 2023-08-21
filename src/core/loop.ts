export class Loop {
  private readonly callback: (delta: number) => void
  private lastTime: number
  private frame: number
  private running: boolean

  // Initialize a new Loop
  constructor (callback: (delta: number) => void) {
    this.callback = callback
    this.lastTime = 0
    this.running = false
    this.frame = 0
  }

  // Starts the loop.
  public start (): void {
    this.running = true
    this.lastTime = performance.now()
    this.frame = 0
    this.loop()
  }

  // Stops the loop.
  public stop (): void {
    this.running = false
  }

  // The main loop function.
  private readonly loop = (): void => {
    if (!this.running) {
      return
    }

    const now = performance.now()
    const delta = now - this.lastTime
    this.lastTime = now
    this.frame += 1

    this.callback(delta)
    requestAnimationFrame(this.loop)
  }
}

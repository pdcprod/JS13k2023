import { type Value2D } from './value2d'

export type TweenCallback = (value: Value2D) => void

export type EasingFunction = (t: number) => number

export const Easing = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
}

export class Tween {
  public disabled: boolean = false
  private startValue: Value2D
  private endValue: Value2D
  private duration: number
  private currentTime: number = 0
  private onComplete: () => void
  private readonly callback: TweenCallback
  private readonly easing: EasingFunction

  constructor ({
    disabled,
    startValue,
    endValue,
    duration,
    onComplete,
    callback,
    easing = Easing.linear
  }: {
    disabled?: boolean
    startValue: Value2D
    endValue: Value2D
    duration: number
    onComplete?: () => void
    callback: TweenCallback
    easing?: EasingFunction
  }) {
    this.disabled = false
    this.startValue = startValue
    this.endValue = endValue
    this.duration = duration
    this.onComplete = onComplete ?? (() => {})
    this.callback = callback
    this.easing = easing
  }

  update (deltaTime: number): void {
    if (this.disabled) return

    if (this.currentTime < this.duration) {
      this.currentTime += deltaTime
      const progress = this.currentTime / this.duration
      const easedProgress = this.easing(progress)

      const currentValue: Value2D = {
        x:
          this.startValue.x +
          (this.endValue.x - this.startValue.x) * easedProgress,
        y:
          this.startValue.y +
          (this.endValue.y - this.startValue.y) * easedProgress
      }

      this.callback(currentValue)
      return
    }

    this.disabled = true
    this.onComplete()
    this.callback(this.endValue)
  }

  reset ({
    startValue,
    endValue,
    duration,
    onComplete
  }: {
    startValue: Value2D
    endValue: Value2D
    duration?: number
    onComplete?: () => void
  }) {
    this.startValue = startValue
    this.endValue = endValue
    this.duration = duration ?? this.duration
    this.currentTime = 0
    this.onComplete = onComplete ?? this.onComplete
    this.disabled = false
  }

  isFinished (): boolean {
    return this.currentTime >= this.duration
  }
}

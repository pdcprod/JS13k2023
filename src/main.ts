import './style.css'

import { Loop } from './core/loop'
import { Game } from './game'
import { createStateTitle } from './stateTitle'
import { createStateGame } from './stateGame'

const game = new Game({
  size: 128,
  density: 0.65
})

const stateTitle = createStateTitle(game)
const stateGame = createStateGame(game)

const loop = new Loop((delta) => {
  if (!game.canvas.ready) return
  game.update(delta)
  game.draw(delta)
})

const splash = true

game.init()
game.setState(splash ? stateTitle : stateGame)
loop.start()

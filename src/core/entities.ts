import { type Entity } from './entity'

export class Entities {
  list: Entity[]

  constructor ({ list = [] }: { list?: Entity[] }) {
    this.list = list
  }

  add (entity: Entity): Entity {
    this.list.push(entity)

    return this.list[this.list.length - 1]
  }

  remove (entity: Entity): void {
    this.list = this.list.filter((e) => e !== entity)
  }

  draw (): void {
    this.list.forEach((entity) => {
      entity.draw()
    })
  }

  update (): void {
    this.list.forEach((entity) => {
      entity.update()
    })
  }
}

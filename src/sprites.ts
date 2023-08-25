export default {
  size: 8,
  terrain: {
    grass: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    roads: [14, 15],
    borders: [16, 17, 18, 32, 34, 48, 49, 50],
    tree: [
      [[19, 20], [35, 36]],
      [[21, 22], [35, 36]],
      [[37, 38], [35, 36]],
      [[23, 24], [39, 40]]
    ],
    trunk: [
      [[25, 26], [41, 42]]
    ]
  },
  flags: [51, 52, 53, 54],
  shields: [55, 56, 57, 58],
  characters: Array.from({ length: 31 }, (_, i) => i + 65),
  buildings: {
    size: 16,
    windmill: 25,
    tower: 26,
    house: 27,
    portal: 28,
    churchLarge: 29,
    churchSmall: 30,
    blacksmith: 31,
    camp: 32,
    volcano: 33,
    tavern: 34,
    waterfall: 35,
    castle: 36,
    structure: 37,
    potion: 38,
    farm: 39,
    cave: 40
  },
  cursor: [95, 96],
  logo: {
    size: { x: 64, y: 16 },
    tile: 11
  },
  title: {
    size: { x: 64, y: 40 },
    tile: 6
  }
}

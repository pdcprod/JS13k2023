export const uniqueId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2, 9)

export const getRandomItem: <T>(arr: T[]) => T = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)]
}

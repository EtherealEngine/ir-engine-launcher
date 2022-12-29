export const delay = (delayMs: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(2)
    }, delayMs)
  })
}
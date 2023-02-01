export const createPeriodicFunction = (func: () => void, minutes: number) => {
  return setInterval(func, minutes * 60 * 1000)
}

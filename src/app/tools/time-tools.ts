
export const measureSync = <T>(callback: () => T): [number, T] => {
  const start = new Date().getTime();
  const result = callback();
  return [new Date().getTime() - start, result];
}

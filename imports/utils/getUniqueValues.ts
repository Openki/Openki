export function getUniqueValues<T>(values: T[]): T[] {
  return [...new Set(values)];
}

/**
 * Return a new object, excluding keys where the `predicate` function returns a falsy result.
 *
 * TS version based on https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore/pull/407/changes
 */
export function omitBy<T extends object>(
  object: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean,
) {
  return Object.fromEntries(
    (Object.entries(object) as [keyof T, T[keyof T]][]).filter(
      ([key, value]) => !predicate(value, key),
    ),
  ) as Partial<T>;
}

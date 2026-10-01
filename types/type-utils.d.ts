/**
 * Get the difference between two types.
 */
type Diff<T, U> = T extends U ? never : T;

/**
 * Pick all properties from a type `T`, preserving their input types and make some properties `TOptional` optional.
 *
 * Source: https://stackoverflow.com/questions/52703321/make-some-properties-optional-in-a-typescript-type#comment96954632_52703444
 */
export type PickWithOptional<T, TOptional extends keyof T> = Pick<T, Diff<keyof T, TOptional>> &
  Partial<T>;

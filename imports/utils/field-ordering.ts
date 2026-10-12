import { check } from "meteor/check";
import { FieldSort } from "./sort-spec";

/**
 * A general comparison function that uses localeCompare() when comparing
 * strings. In an ideal world we would ask the objects for comparable values
 * from the fields we want to compare. And we would know their type so we needn't
 * guess the appropriate comparison function.
 */
function genComp<T>(a: T, b: T) {
  if (typeof a === "string" && typeof b === "string") {
    // At the moment we don't provide a way to choose the locale :-(
    // So it will be sorted under whatever locale the server is running.
    return a.localeCompare(b, undefined, { sensitivity: "accent" });
  }
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

const FieldComp =
  (field: string) =>
  <T>(a: Record<string, T>, b: Record<string, T>) => {
    check(a, Object);
    check(b, Object);
    return genComp(a[field], b[field]);
  };

/** This is the base case when we run out of fields to compare */
const equal = () => 0;

/**
 * Invert the order of arguments of a comparison function
 * For our purposes it turns 'ascending' into 'descending'.
 */
const swap =
  <T, U>(f: (b: U, a: T) => number) =>
  (a: T, b: U) =>
    f(b, a);

/**
 * Creates an ordering from a SortSpec
 *
 * When object fields are undefined, the behaviour is undefined.
 */
export const FieldOrdering = function (sortSpec: { spec: () => FieldSort[] }) {
  // Build chain of compare functions that refer to the next field
  // if the current field values are equal.
  const ordering = <T>() =>
    sortSpec
      .spec()
      .reduceRight(
        (
          chain: (a: Record<string, T>, b: Record<string, T>) => number,
          [field, order]: FieldSort,
        ) => {
          const fieldComp = FieldComp(field);
          const directedComp = order === "asc" ? fieldComp : swap(fieldComp);
          return (a: Record<string, T>, b: Record<string, T>) =>
            directedComp<T>(a, b) || chain(a, b);
        },
        equal,
      );
  const copy = <T>(list: T[]) => list.slice();

  return {
    /**
     * @returns a compare function(a, b) that returns
     * - zero if a and b cannot be ranked ("they're equal")
     * - a negative number if a comes before b ("a is less")
     * - a positive number if a comes after b ("a is more")
     */
    ordering,
    /** @returns a new list with the items sorted according to spec */
    sorted: <T>(list: Record<string, T>[]) => copy(list).toSorted(ordering()),
  };
};

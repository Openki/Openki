import { Match, check } from "meteor/check";
import sanitizeHtml from "sanitize-html";

/** Helper type utility to filter out not undefined properties: https://www.typescriptlang.org/docs/handbook/2/mapped-types.html */
type PickNotUndefined<T> = {
  [P in keyof T as Extract<T[P], undefined> extends never ? P : never]: T[P];
};

/** Helper type utility to remove undefined and null from the properties types */
type RecursiveNonNullable<T> = { [P in keyof T]: NonNullable<T[P]> };

/** Make properties that are may be undefined optional. */
type UndefinedToOptional<T> = RecursiveNonNullable<Partial<T>> & Pick<T, keyof PickNotUndefined<T>>;

/** Recursive make properties that are may be undefined optional. */
type RecursiveUndefinedToOptional<T> = UndefinedToOptional<{
  [P in keyof T]: T[P] extends (infer U)[]
    ? RecursiveUndefinedToOptional<U>[]
    : T[P] extends object
      ? RecursiveUndefinedToOptional<T[P]>
      : T[P] extends object | undefined
        ? RecursiveUndefinedToOptional<T[P]> | undefined
        : T[P] extends object | undefined | null
          ? RecursiveUndefinedToOptional<T[P]> | undefined | null
          : T[P];
}>;

/** Match.Optional and Match.Maybe behaves different when the pattern is a property of a object or not. */
type BaseOrObjectMatchHelper<T> = T extends object ? RecursiveUndefinedToOptional<T> : T;

/** Convert a meteor/check Match.Pattern to a typescript type */
export type Type<T extends Match.Pattern> = BaseOrObjectMatchHelper<Match.PatternMatch<T>>;

export function Tuple<T extends readonly Match.Pattern[]>(...pattern: [...T]) {
  return Match.Where(function (values) {
    check(values, [Match.Any]);

    if (values.length !== pattern.length) {
      return false;
    }

    values.forEach((value, index) => {
      check(value, pattern[index]);
    });
    return true;
  }) as unknown as Match.Matcher<
    {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      [K in keyof T]: Match.PatternMatch<T[K]>;
    }
  >;
}

/** String without HTML. */
export function SafeString() {
  return Match.Where(function (str) {
    check(str, String);

    return (
      sanitizeHtml(str, {
        allowedTags: [],
        allowedAttributes: {},
      }) === str
    );
  }) as Match.Matcher<string>;
}

/**
 * Utility typ: An unsafe string that may contain html and needs to be sanitized with
 * `HtmlTools.saneHtml(...)` \
 * *Note: HTMLElement is only symbolic and should remind the developer that
 * this string could contain HTML.*
 */
export type UnsafeString = string | HTMLElement;

export function HtmlString() {
  return Match.Where(function (str) {
    check(str, String);
    return true;
  }) as Match.Matcher<UnsafeString>;
}

export function StringEnum<T extends readonly string[]>(...values: T) {
  return Match.Where(function (str) {
    check(str, String);
    return values.includes(str);
  }) as Match.Matcher<(typeof values)[number]>;
}

export function Record<T extends Match.Pattern>(type: T) {
  return Match.Where((c) => {
    check(c, Object);
    Object.values(c).forEach((value) => {
      check(value, type);
    });
    return true;
  }) as Match.Matcher<Record<string, Match.PatternMatch<T>>>;
}

export function Deprecated<T extends Match.Pattern>(pattern: T, text: string) {
  return Match.Where((value) => {
    // First ensure the value still matches the legacy shape
    check(value, pattern);

    // Then always reject with a clear deprecation message
    throw new (Match as any).Error(`Deprecated: ${text}`);
  }) as Match.Matcher<Match.PatternMatch<T>>;
}

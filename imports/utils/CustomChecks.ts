import { Match, check } from 'meteor/check';

/** Helper type utility to filter out not undefined properties: https://www.typescriptlang.org/docs/handbook/2/mapped-types.html */
type PickNotUndefined<T> = {
	[P in keyof T as Extract<T[P], undefined> extends never ? P : never]: T[P];
};

/** Make properties that are may be undefined also optional. */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type UndefinedToOptional<T> = Partial<T> & Pick<T, keyof PickNotUndefined<T>>;

/** Recursive make properties that are may be undefined also optional. */
export type RecursiveUndefinedToOptional<T> = UndefinedToOptional<{
	[P in keyof T]: T[P] extends (infer U)[]
		? RecursiveUndefinedToOptional<U>[]
		: T[P] extends object
		? RecursiveUndefinedToOptional<T[P]>
		: T[P] extends object | undefined
		? RecursiveUndefinedToOptional<T[P]> | undefined
		: T[P];
}>;

/** Convert a meteor/check Match.Pattern to a typescript type */
export type Type<T extends Match.Pattern> = RecursiveUndefinedToOptional<Match.PatternMatch<T>>;

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
	}) as unknown as Match.Matcher<{
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		[K in keyof T]: Match.PatternMatch<T[K]>;
	}>;
}

export function StringEnum<T extends readonly string[]>(...values: T) {
	return Match.Where(function (str) {
		check(str, String);
		return values.includes(str);
	}) as Match.Matcher<typeof values[number]>;
}

export function Record<T extends Match.Pattern>(type: T) {
	return Match.Where((c) => {
		check(c, Object);
		Object.values(c).forEach((value) => {
			check(value, type);
		});
		return true;
	}) as Match.Matcher<{
		[category: string]: Match.PatternMatch<T>;
	}>;
}

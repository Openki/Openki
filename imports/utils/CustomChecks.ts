import { Match, check } from 'meteor/check';

/** Make properties that are may be undefined also optional. */
type UndefinedToOptional<Type> = Type extends Record<string, unknown>
	? {
			[Property in keyof Type as Extract<Type[Property], undefined> extends never
				? Property
				: never]: UndefinedToOptional<Type[Property]>;
	  } & {
			[Property in keyof Type as Extract<Type[Property], undefined> extends never
				? never
				: Property]?: UndefinedToOptional<Type[Property]>;
	  }
	: Type;

/** Convert a meteor/check Match.Pattern to a typescript type */
export type Type<Pattern extends Match.Pattern> = UndefinedToOptional<Match.PatternMatch<Pattern>>;

export function Tuple<T extends readonly Match.Pattern[]>(pattern: [...T]) {
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

export function StringEnum<T extends readonly string[]>(values: T) {
	return Match.Where(function (str) {
		check(str, String);
		return values.includes(str);
	}) as Match.Matcher<typeof values[number]>;
}

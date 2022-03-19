import { check } from 'meteor/check';

export type FieldSort = [string, 'asc' | 'desc'];

// SortSpec interface

/**
 * builds a SortSpec from a given mongo sort-specifier
 */
export const SortSpec = (spec: FieldSort[]) => {
	check(spec, [[String]]);
	return {
		/**
		 * @returns a mongo sort-specifier of the form [['name', 'asc'], ['age', 'desc']]
		 */
		spec: () => spec,
	};
};

/**
 * reads a string of the form "name,-age"
 */
SortSpec.fromString = function (spec: string) {
	check(spec, String);

	return SortSpec(
		spec
			.split(',')
			.filter(Boolean)
			.map((field) => {
				if (field.startsWith('-')) {
					return [field.slice(1), 'desc'];
				}
				return [field, 'asc'];
			}),
	);
};

/**
 * builds a SortSpec which imposes no ordering.
 */
SortSpec.unordered = () => SortSpec([]);

export default SortSpec;


import { check } from 'meteor/check';

// SortSpec interface

/**
 * builds a SortSpec from a given mongo sort-specifier
 * @param {string[][]} spec
 */
const SortSpec = (spec) => {
	check(spec, [[String]]);
	return {
		/**
		 * @returns {string[][]} returns a  mongo sort-specifier of the form
		 * [['name', 'asc'], ['age', 'desc']]
		 */
		spec: () => spec,
	};
};

/**
 * reads a string of the form "name,-age"
 * @param {string} spec
 */
SortSpec.fromString = function (spec) {
	check(spec, String);

	return SortSpec(spec.split(',').filter(Boolean).map((field) => {
		if (field.indexOf('-') === 0) {
			return [field.slice(1), 'desc'];
		}
		return [field, 'asc'];
	}));
};

/**
 * builds a SortSpec which imposes no ordering.
 */
SortSpec.unordered = () => SortSpec([]);

export default SortSpec;


import { check } from 'meteor/check';

// SortSpec interface
//
// spec() returns a  mongo sort-specifier of the form 
//   [['name', 'asc'], ['age', 'desc']]
//
// Constructors:
//
// SortSpec(spec) builds a SortSpec from a given mongo sort-specifier.
// SortSpec.fromString(str) reads a string of the form "name,-age"
// SortSpec.unordered() builds a SortSpec which imposes no ordering.

export default SortSpec = (spec) => {
    check(spec, [[String]]);
    return { spec: () => spec };
};

SortSpec.fromString = function(spec) {
    check(spec, String);

    return SortSpec(spec.split(',').filter(Boolean).map((field) => {
        if (field.indexOf('-') === 0) {
            return [ field.slice(1), 'desc' ];
        }
        return [ field, 'asc' ];
    }));
};

SortSpec.unordered = () => SortSpec([]);
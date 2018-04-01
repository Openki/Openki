/* jshint -W024 */
/* jshint expr:true */

import { assert } from 'chai';
import '/imports/utils/sort-spec.js';

// This should not be here
msgfmt.init('en');

describe('Sort specification parsing', function() {
	it("gives empty mongo sort specifier for empty string", function() {
		assert.deepEqual(SortSpec.fromString("").spec(), []);
	});

	it("reads simple sort classifier", function() {
        const expected = [[ "name", "asc" ]];
		assert.deepEqual(SortSpec.fromString("name").spec(), expected);
	});

	it("reads two sort classifiers", function() {
        const expected = [[ "name", "asc" ], [ "age", "asc" ]];
		assert.deepEqual(SortSpec.fromString("name,age").spec(), expected);
    });

	it("respects descending sign", function() {
        const expected = [[ "name", "desc" ]];
		assert.deepEqual(SortSpec.fromString("-name").spec(), expected);
    });

	it("reads second descending sign", function() {
        const expected = [[ "name", "asc" ], [ "age", "desc" ]];
		assert.deepEqual(SortSpec.fromString("name,-age").spec(), expected);
    });

	it("doesn't care about hyphens in other places", function() {
        const expected = [[ "t-e-s-t-", "asc" ]];
		assert.deepEqual(SortSpec.fromString("t-e-s-t-").spec(), expected);
    });
    
	it("rejects invalid sort specification", function() {
		// Unfortunately the check only catches the most glaring errors.
		// We only check for those. Better than nothing.
		assert.throws(() => SortSpec(['name']), Error);
		assert.throws(() => SortSpec([[], 'name']), Error);
	});
});
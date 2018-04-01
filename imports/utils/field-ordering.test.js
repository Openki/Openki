/* jshint -W024 */
/* jshint expr:true */

import { assert } from 'chai';
import '/imports/utils/field-ordering.js';
import '/imports/utils/sort-spec.js';

// This should not be here
msgfmt.init('en');

describe('Ordering by object fields ', function() {
    const empty = {};
    const smallerB = { a: 1, b: 1 };
    const biggerB = { a: 1, b: 2 };
    const somethingElse = { c: 3 };

    const indiscriminate = FieldOrdering(SortSpec.unordered()).ordering();
    const byA      = FieldOrdering(SortSpec([[ 'a', 'asc' ]])).ordering();
    const byADesc  = FieldOrdering(SortSpec([[ 'a', 'desc' ]])).ordering();
    const byAThenB = FieldOrdering(SortSpec([[ 'a', 'asc' ], [ 'b', 'asc' ]])).ordering();
    const byB      = FieldOrdering(SortSpec([[ 'b', 'asc' ]])).ordering();
    const byBDesc  = FieldOrdering(SortSpec([[ 'b', 'desc' ]])).ordering();

	it("remains indiscriminate for empty sort spec", function() {
		assert.equal(indiscriminate(empty, empty), 0);
		assert.equal(indiscriminate(smallerB, biggerB), 0);
		assert.equal(indiscriminate(smallerB, somethingElse), 0);
	});

	it("remains indiscirminate when field is equal", function() {
		assert.equal(byA(smallerB, biggerB), 0);
		assert.equal(byADesc(smallerB, biggerB), 0);
	});

	it("remains indiscirminate when fields are equal", function() {
		assert.equal(byAThenB(smallerB, smallerB), 0);
    });
    
	it("orders before when first is smaller", function() {
		assert.isBelow(byB(smallerB, biggerB), 0);
	});

	it("orders after when first is bigger", function() {
		assert.isAbove(byB(biggerB, smallerB), 0);
    });

	it("orders descending", function() {
		assert.isAbove(byBDesc(smallerB, biggerB), 0);
		assert.isBelow(byBDesc(biggerB, smallerB), 0);
    });

	it("prioritizes first field", function() {
		assert.isBelow(byAThenB({ a: 1, b: 2 }, { a: 2, b: 1 }), 0);
		assert.isAbove(byAThenB({ a: 2, b: 1 }, { a: 1, b: 2 }), 0);
	});

	it("orders by second field if first is equal", function() {
		assert.isBelow(byAThenB(smallerB, biggerB), 0);
		assert.isAbove(byAThenB(biggerB, smallerB), 0);
	});

	it("orders mixed-case consistently", function() {
		// We don't really care about the specifics of the sort.
		// It should just be consistent.
		const lowerBeforeUpper = byA({ a: "a" }, { a: "A" });
		assert.equal(byA({ a: "A" }, { a: "a" }), lowerBeforeUpper * -1);
		assert.equal(byA({ a: "ab" }, { a: "aB" }), lowerBeforeUpper);
		assert.equal(byA({ a: "aB" }, { a: "ab" }), lowerBeforeUpper * -1);
	});

	it("doesn't fail on undefined fields", function() {
		// This test ensures that we survive when trying to sort objects
		// where fields we sort by are undefined.
		const byNah = FieldOrdering(SortSpec([[ 'nah', 'asc' ]])).ordering();
		byNah({}, {});
		byNah({ nah: 1 }, {});
		byNah({}, { nah: 1 });
		byNah({ nah: undefined }, {});
	});

	it("sorts list", function() {
		const orderA = FieldOrdering(SortSpec([[ 'a', 'asc' ]]));
		const expected = [{ a: 1 }, { a: 2 }, { a: 3} ];
		const input = expected.slice();
		input[0] = expected[2];
		input[2] = expected[0];
		assert.deepEqual(orderA.sorted(input), expected);
	});
});
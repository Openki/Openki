import { assert } from 'chai';
import { SortSpec } from '/imports/utils/sort-spec';

describe('Sort specification parsing', () => {
	it('gives empty mongo sort specifier for empty string', () => {
		assert.deepEqual(SortSpec.fromString('').spec(), []);
	});

	it('reads simple sort classifier', () => {
		const expected = [['name', 'asc']];
		assert.deepEqual(SortSpec.fromString('name').spec(), expected);
	});

	it('reads two sort classifiers', () => {
		const expected = [
			['name', 'asc'],
			['age', 'asc'],
		];
		assert.deepEqual(SortSpec.fromString('name,age').spec(), expected);
	});

	it('respects descending sign', () => {
		const expected = [['name', 'desc']];
		assert.deepEqual(SortSpec.fromString('-name').spec(), expected);
	});

	it('reads second descending sign', () => {
		const expected = [
			['name', 'asc'],
			['age', 'desc'],
		];
		assert.deepEqual(SortSpec.fromString('name,-age').spec(), expected);
	});

	it("doesn't care about hyphens in other places", () => {
		const expected = [['t-e-s-t-', 'asc']];
		assert.deepEqual(SortSpec.fromString('t-e-s-t-').spec(), expected);
	});

	it('rejects invalid sort specification', () => {
		// Unfortunately the check only catches the most glaring errors.
		// We only check for those. Better than nothing.
		assert.throws(() => SortSpec(['name'] as any), Error);
		assert.throws(() => SortSpec([[], 'name'] as any), Error);
	});
});

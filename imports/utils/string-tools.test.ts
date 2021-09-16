import { assert, expect } from 'chai';
import * as StringTools from '/imports/utils/string-tools';

describe('String tools', () => {
	describe('Slug', () => {
		it('should lowercase', () => {
			const input = 'JoHn';
			const output = 'john';
			assert.equal(StringTools.slug(input), output);
		});

		it('should transforms Ümlauts to Uemlauts', () => {
			const input = 'ötzi';
			const output = 'oetzi';
			assert.equal(StringTools.slug(input), output);
		});

		it('should replace space with dashes', () => {
			const input = 'john foe';
			const output = 'john-foe';
			assert.equal(StringTools.slug(input), output);
		});

		it('should replace double dashes with one dashe', () => {
			const input = 'john--foe';
			const output = 'john-foe';
			assert.equal(StringTools.slug(input), output);
		});

		it('should not start with a dash', () => {
			const input = '-john';
			const output = 'john';
			assert.equal(StringTools.slug(input), output);
		});

		it('should not end with a dash', () => {
			const input = 'john-';
			const output = 'john';
			assert.equal(StringTools.slug(input), output);
		});

		it('should trim to long urls', () => {
			const input =
				'johnfoejohnfoejohnfoejohnfoejohnfoejohnfoejohnfoejohnfoejohnfoejohnfoejohnfoejohnfoejohnfoejohnfoejohnfoejohnfoejohnfoejohnfoejohnfoejohnfoejohnfoejohnfoejohnfoe';
			expect(StringTools.slug(input)).to.have.length(80);
		});
	});

	describe('The text sanitizer', () => {
		it('leaves a simple name intact', () => {
			const simpleName = 'John Foe';
			assert.equal(StringTools.saneText(simpleName), simpleName);
		});

		it('leaves a name with Ümlauts intact', () => {
			const umlautyName = 'Ötzi Jowäger';
			assert.equal(StringTools.saneText(umlautyName), umlautyName);
		});

		it('removes choice nonprinting chars', () => {
			const withNonPrinting = 'NUL\0BEL\x07NUL\0';
			const onlyPrinting = 'NULBELNUL';
			assert.equal(StringTools.saneText(withNonPrinting), onlyPrinting);
		});

		it('leaves line feeds intact', () => {
			const withLineFeed = 'LF\nEOF';
			assert.equal(StringTools.saneText(withLineFeed), withLineFeed);
		});
	});
});

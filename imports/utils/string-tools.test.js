import { assert } from 'chai';
import { StringTools } from '/imports/utils/string-tools';

// This should not be here
msgfmt.init('en');

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

/* jshint -W024 */
/* jshint expr:true */

import { assert } from 'chai';
import StringTools from '/imports/utils/string-tools.js';

// This should not be here
msgfmt.init('en');

describe('The text sanitizer', function() {
	it("leaves a simple name intact", function() {
		const simpleName = "John Foe";
		assert.equal(StringTools.saneText(simpleName), simpleName);
	});

	it("leaves a name with Ümlauts intact", function() {
		const umlautyName = "Ötzi Jowäger";
		assert.equal(StringTools.saneText(umlautyName), umlautyName);
	});

	it("removes choice nonprinting chars", function() {
		const withNonPrinting = "NUL\0BEL\x07NUL\0";
		const onlyPrinting = "NULBELNUL";
		assert.equal(StringTools.saneText(withNonPrinting), onlyPrinting);
	});

	it("leaves line feeds intact", function() {
		const withLineFeed = "LF\nEOF";
		assert.equal(StringTools.saneText(withLineFeed), withLineFeed);
	});
});

/* jshint -W024 */
/* jshint expr:true */

import { assert } from 'chai';
import HtmlTools from '/imports/utils/html-tools.js';

describe.only('Converting Text to HTML', function() {
	it("turns linebreak into break-tag", function() {
		assert.include(HtmlTools.plainToHtml("a\nb"), "<br");
	});
	it("escapes angle brackets", function() {
		assert.notInclude(HtmlTools.plainToHtml("<><"), "<");
	});
});

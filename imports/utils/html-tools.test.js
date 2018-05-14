/* jshint -W024 */
/* jshint expr:true */

import { assert } from 'chai';
import HtmlTools from '/imports/utils/html-tools.js';
import sanitizeHtml from 'sanitize-html';

describe('Converting Text to HTML', function() {
	it("turns linebreak into break-tag", function() {
		assert.include(HtmlTools.plainToHtml("a\nb"), "<br");
	});
	it("escapes angle brackets", function() {
		assert.notInclude(HtmlTools.plainToHtml("<><"), "<");
	});
	it("hyperlinks links", function() {
		var url = "http://openki.net";
		var html = HtmlTools.plainToHtml(url);
		assert.include(html, "href");
		assert.include(html, url);
	});
	it("hyperlinks valid", function() {
		var html = HtmlTools.plainToHtml("http://openki.net");
		var options = {
			allowedTags: [ 'a' ],
			allowedAttributes: {
				'a': [ 'href' ]
			}
		};
	 	var sanehtml = sanitizeHtml(html, options);
		assert.include(sanehtml, "href");
	});
	it("hyperlinks ampersand url", function() {
		var url = "http://openki.net/?&";
		var html = HtmlTools.plainToHtml(url);
		assert.include(html, "&amp;");
	});

});

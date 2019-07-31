import sanitizeHtml from 'sanitize-html';

const HtmlTools = {};

/** Turn plaintext into HTML by replacing HTML characters with their entities
  * and newlines with break-tags.
  *
  * @param {String} text input text
  * @return {String} HTMLized version of text
  */
// eslint-disable-next-line func-names
HtmlTools.plainToHtml = function (text) {
	check(text, String);
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;')
		.replace(/(?:\r\n|\r|\n)/g, '<br />')
		.replace(/(\bhttps?:\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|;])/ig, "<a href='$1'>$1</a>");
};

// eslint-disable-next-line func-names
HtmlTools.saneHtml = function (unsaneHtml) {
	// The rel=nofollow is added so that our service is less attractive to forum spam
	const options = {
		allowedTags: ['br', 'p', 'b', 'i', 'u', 'a', 'h3', 'h4', 'blockquote', 'ul', 'ol', 'li'],
		allowedAttributes: {
			a: ['href', 'rel'],
		},
		transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'nofollow' }, true) },
	};

	return sanitizeHtml(unsaneHtml, options);
};

// eslint-disable-next-line func-names
HtmlTools.textPlain = function (html) {
	return sanitizeHtml(html, {
		allowedTags: [],
		allowedAttributes: {},
	});
};

export default HtmlTools;

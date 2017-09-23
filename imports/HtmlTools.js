export default HtmlTools = {};

/** Turn plaintext into HTML by replacing HTML characters with their entities
  * and newlines with break-tags.
  *
  * @param {String} text input text
  * @return {String} HTMLized version of text
  */
HtmlTools.plainToHtml = function(text) {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;")
		.replace(/(?:\r\n|\r|\n)/g, '<br />');
};


HtmlTools.saneHtml = function(unsaneHtml, nofollow) {
	// The rel=nofollow is added so that our service is less attractive to forum spam
	var options = {
		allowedTags: [ 'br', 'p', 'b', 'i', 'u', 'a', 'h3', 'h4', 'blockquote', 'ul', 'ol', 'li' ],
		allowedAttributes: {
			'a': [ 'href', 'rel' ]
		},
		transformTags: { 'a': sanitizeHtml.simpleTransform('a', { rel: 'nofollow' }, true) }
	};

	return sanitizeHtml(unsaneHtml, options);
};


HtmlTools.textPlain = function(html) {
	return sanitizeHtml(html, {
		allowedTags: [],
		allowedAttributes: {}
	});
};

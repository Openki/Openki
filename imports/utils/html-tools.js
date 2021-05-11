import sanitizeHtml from 'sanitize-html';
import { check } from 'meteor/check';

/**
 * Turn plaintext into HTML by replacing HTML characters with their entities
 * and newlines with break-tags.
 *
 * @param {string} text input text
 * @return {string} HTMLized version of text
 */
export function plainToHtml(text) {
	check(text, String);
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;')
		.replace(/(?:\r\n|\r|\n)/g, '<br />')
		.replace(
			/(\bhttps?:\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|;])/gi,
			"<a href='$1'>$1</a>",
		);
}

/**
 * @param {string} unsaneHtml
 * @return {string}
 */
export function saneHtml(unsaneHtml) {
	// The rel=nofollow is added so that our service is less attractive to forum spam
	const options = {
		allowedTags: ['br', 'p', 'b', 'i', 'u', 'a', 'h3', 'h4', 'blockquote', 'ul', 'ol', 'li'],
		allowedAttributes: {
			a: ['href', 'rel'],
		},
		transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'nofollow' }, true) },
	};

	return sanitizeHtml(unsaneHtml, options);
}

/**
 * @param {string} html
 * @return {string}
 */
export function textPlain(html) {
	return sanitizeHtml(html, {
		allowedTags: [],
		allowedAttributes: {},
	});
}

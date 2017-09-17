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

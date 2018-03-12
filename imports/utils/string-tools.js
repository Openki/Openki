export default StringTools = {};

/** Truncate long strings, adding ellipsis char when the string was long
  *
  * @param {String} src the string to be truncated
  * @param {Number} max the maximum length of the string
  * @param {String} ellipsis the string to add that signifies that src was truncated, preset "…", does not count towards max.
  */
StringTools.truncate = function(src, max, ellipsis = '…') {
	check(src, String);
	check(max, Number);
	if (src.length > max) {
		return src.substring(0, max) + ellipsis;
	}
	return src;
};

/** Capitalize first letter of String
  *
  * @param {String} input the string to be capitalized
  * @return the capitalized string
  */
StringTools.capitalize = function(input) {
	check(input, String);
    return input.charAt(0).toUpperCase() + input.slice(1);
};

StringTools.markedName = (search, name) => {
	if (search === '') return name;
	const match = name.match(new RegExp(search, 'i'));

	// To add markup we have to escape all the parts separately
	let marked;
	if (match) {
		const term = match[0];
		const parts = name.split(term);
		marked =
			parts
			.map(Blaze._escape)
			.join('<strong>' + Blaze._escape(term) + '</strong>');
	} else {
		marked = Blaze._escape(name);
	}
	return Spacebars.SafeString(marked);
};

StringTools.slug = function(text) {
	return text
		.toLowerCase()
		.replace(/[^\w ]+/g,'')
		.replace(/ +/g,'-');
};


StringTools.escapeRegex = function(string) {
	return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
};


// Remove non-printable chars and linebreaks from string
// All runs of whitespace are replaced with one space.
StringTools.saneTitle = function(unsaneText) {
	let text = unsaneText.replace(/[\n\r]/g, "");
	text = text.replace(/\s+/g, ' ');
	return StringTools.saneText(text);
};


// Remove non-printable chars from string
StringTools.saneText = function(unsaneText) {
	// Remove all ASCII control chars except the line feed.
	var re = /[\0-\x09\x0B-\x1F\x7F]/g;

	const text = unsaneText.replace(re, "");

	return text.trim();
};

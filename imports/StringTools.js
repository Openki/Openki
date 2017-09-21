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

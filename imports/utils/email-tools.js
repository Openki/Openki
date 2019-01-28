/** Check a string if it is a valid email adress
  *
  * @param {String} the string to be checked
  */
export const IsEmail = function(str) {
	check(str, String);
	return str.search(/^[^@\s]+@([^@.\s]+\.)+\w+$/g) === 0;
};
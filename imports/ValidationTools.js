/** Check a string if it is a valid email adress
  *
  * @param {String} the string to be checked
  */
export function isEmail(str) {
	// consider string as valid email if it matches this pattern:
	// (1+ characters)@(1+ characters).(1+ characters)
	return str.search(/^[^@\s]+@[^@.\s]+\.\w+$/g) >= 0;
}

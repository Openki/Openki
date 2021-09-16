import { check } from 'meteor/check';

/**
 * Check a string if it is a valid email adress
 * @param str the string to be checked
 */
export function isEmail(str: string) {
	check(str, String);
	return str.search(/^[^@\s]+@([^@.\s]+\.)+\w+$/g) === 0;
}

export default isEmail;

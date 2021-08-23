import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

/**
 * Check a string if it is a valid email adress
 * @param str the string to be checked
 */
export function isEmail(str: string) {
	check(str, String);
	return str.search(/^[^@\s]+@([^@.\s]+\.)+\w+$/g) === 0;
}

/**
 * provides sender and recipient email for report-email,defaults to
 * sender reporter@mail.openki.net and recipient admins@openki.net
 * if not set in configfile.
 *
 * @returns the desired sender and rcpt email
 */
export function getReportEmails() {
	return {
		sender: Meteor.settings.reporter?.sender || 'reporter@mail.openki.net',
		recipient: Meteor.settings.reporter?.recipient || 'admins@openki.net',
	};
}

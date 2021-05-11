import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Random } from 'meteor/random';

/**
 * Check a string if it is a valid email adress
 * @param {string} str the string to be checked
 */
export function isEmail(str) {
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

export class Logo {
	/**
	 * Logo that can be attached to mails
	 * @param {string} path a file path relative to private/
	 */
	constructor(path) {
		check(path, String);
		const cid = Random.id();
		this.url = `cid:${cid}`;
		this.attachement = {
			cid,
			path: Assets.absoluteFilePath(path),
			filename: false,
		};
		return this;
	}
}

export default isEmail;

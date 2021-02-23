import { check } from 'meteor/check';

/**
  * Check a string if it is a valid email adress
  * @param {string} str the string to be checked
  */
const IsEmail = function (str) {
	check(str, String);
	return str.search(/^[^@\s]+@([^@.\s]+\.)+\w+$/g) === 0;
};

export default IsEmail;

/**
 * provides sender and recipient email for report-email,defaults to
 * sender reporter@mail.openki.net and recipient admins@openki.net
 * if not set in configfile.
 *
 * @returns {{sender: string; recipient: string;}} - the desired sender and rcpt email
 */
export const getReportEmails = () => {
	// preset, please override from configfile
	const reportEmails = {
		sender: 'reporter@mail.openki.net',
		recipient: 'admins@openki.net',
	};
	if (Meteor.settings.reporter?.sender) {
		reportEmails.sender = Meteor.settings.reporter.sender;
	}
	if (Meteor.settings.reporter?.recipient) {
		reportEmails.recipient = Meteor.settings.reporter.recipient;
	}
	return reportEmails;
};

/**
  * Logo that can be attached to mails
  * @param {string} path a file path relative to private/
  */
export const logo = function (path) {
	check(path, String);
	const cid = Random.id();
	this.url = `cid:${cid}`;
	this.attachement = {
		cid,
		path: Assets.absoluteFilePath(path),
		filename: false,
	};
	return this;
};

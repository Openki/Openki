import { Accounts } from 'meteor/accounts-base';
import { Match, check } from 'meteor/check';
import { Email } from 'meteor/email';
import { SSR } from 'meteor/meteorhacks:ssr';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';

import Version from '/imports/api/version/version';
import { Users } from '/imports/api/users/users';

import Notification from '/imports/notification/notification';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import * as HtmlTools from '/imports/utils/html-tools';
import { getReportEmails } from '/imports/utils/email-tools';
import { ServerMethod } from '/imports/utils/ServerMethod';

/** @typedef {import('/imports/api/users/users').UserModel} UserModel */

export const sendVerificationEmail = ServerMethod('sendVerificationEmail', () => {
	Accounts.sendVerificationEmail(Meteor.userId());
});

export const sendEmail = ServerMethod(
	'sendEmail',
	/**
	 * @param {string} userId
	 * @param {string} message
	 * @param {{
	 * revealAddress: boolean;
	 * sendCopy: boolean;
	 * courseId?: string;
	 * eventId?: string;
	 * }} options
	 */
	(userId, message, options) => {
		check(userId, String);
		check(message, String);
		check(options.revealAddress, Boolean);
		check(options.sendCopy, Boolean);
		check(options.courseId, Match.Optional(String));
		check(options.eventId, Match.Optional(String));

		const recipient = Users.findOne(userId);
		if (!recipient) {
			throw new Meteor.Error(404, 'no such user');
		}
		if (!recipient.acceptsPrivateMessages && !UserPrivilegeUtils.privilegedTo('admin')) {
			throw new Meteor.Error(401, 'this user does not accept private messages from users');
		}

		const context = {};
		if (options.courseId) {
			context.course = options.courseId;
		}
		if (options.eventId) {
			context.event = options.eventId;
		}

		Notification.PrivateMessage.record(
			Meteor.userId(),
			recipient._id,
			message,
			options.revealAddress,
			options.sendCopy,
			context,
		);
	},
);

export const report = ServerMethod('report', (subject, location, userAgent, reportMessage) => {
	let reporter = 'A fellow visitor';
	const rootUrl = Meteor.absoluteUrl();
	const user = Meteor.user();
	if (user) {
		reporter = `<a href='${rootUrl}user/${user._id}'>${HtmlTools.plainToHtml(user.username)}</a>`;
	}
	moment.locale('en');
	const version = Version.findOne();
	let versionString = '';
	if (version) {
		const fullVersion = version.basic + (version.branch !== 'master' ? ` ${version.branch}` : '');
		const commit = version.commitShort;
		const deployDate = moment(version.activation).format('lll');
		const restart = moment(version.lastStart).format('lll');
		versionString =
			`<br>The running version is [${Accounts.emailTemplates.siteName}] ${fullVersion}  @ commit ${commit}` +
			`<br>It was deployed on ${deployDate},` +
			`<br>and last restarted on ${restart}.`;
	}

	const reportEmail = getReportEmails();
	Email.send({
		from: reportEmail.sender,
		to: reportEmail.recipient,
		subject: `Report: ${subject}`,
		html: SSR.render('messageReport', {
			reporter,
			location,
			subject,
			report: reportMessage,
			versionString,
			timeNow: new Date(),
			userAgent,
		}),
	});
});

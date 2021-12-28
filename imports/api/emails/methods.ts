import { Accounts } from 'meteor/accounts-base';
import { Match, check } from 'meteor/check';
import { Email } from 'meteor/email';
import { SSR } from 'meteor/meteorhacks:ssr';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';
import juice from 'juice';

import Version from '/imports/api/version/version';
import { Users } from '/imports/api/users/users';

import { Notification } from '/imports/notification/notification';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import * as HtmlTools from '/imports/utils/html-tools';
import { ServerMethod } from '/imports/utils/ServerMethod';
import { base64PngImageData } from '/imports/utils/base64-png-image-data';
import { PublicSettings } from '/imports/utils/PublicSettings';
import { PrivateSettings } from '/imports/utils/PrivateSettings';

export const sendVerificationEmail = ServerMethod(
	'sendVerificationEmail',
	() => {
		const userId = Meteor.userId();
		if (!userId) {
			throw new Meteor.Error(401, 'please log in');
		}

		Accounts.sendVerificationEmail(userId);
	},
	{ simulation: false },
);

export interface SendEmailOptions {
	revealAddress: boolean;
	sendCopy: boolean;
	courseId?: string;
	eventId?: string;
}

export const sendEmail = ServerMethod(
	'sendEmail',
	(userId: string, message: string, options: SendEmailOptions) => {
		check(userId, String);
		check(message, String);
		check(options, {
			revealAddress: Boolean,
			sendCopy: Boolean,
			courseId: Match.Optional(String),
			eventId: Match.Optional(String),
		});

		const operator = Meteor.user();
		if (!operator) {
			throw new Meteor.Error(401, 'please log in');
		}

		const recipient = Users.findOne(userId);
		if (!recipient) {
			throw new Meteor.Error(404, 'no such user');
		}
		if (!recipient.acceptsPrivateMessages && !UserPrivilegeUtils.privileged(operator, 'admin')) {
			throw new Meteor.Error(401, 'this user does not accept private messages from users');
		}

		const context: { course?: string; event?: string } = {};
		if (options.courseId) {
			context.course = options.courseId;
		}
		if (options.eventId) {
			context.event = options.eventId;
		}

		Notification.PrivateMessage.record(
			operator._id,
			recipient._id,
			message,
			options.revealAddress,
			options.sendCopy,
			context,
		);
	},
);

export const report = ServerMethod(
	'report',
	(title, location, userAgent, reportMessage) => {
		let reporter = 'A fellow visitor';
		const rootUrl = Meteor.absoluteUrl();
		const user = Meteor.user();
		if (user) {
			reporter = `<a href='${rootUrl}user/${user._id}'>${HtmlTools.plainToHtml(user.username)}</a>`;
		}
		moment.locale('en');

		const { siteName } = Accounts.emailTemplates;

		const version = Version.findOne();
		let versionString = '';
		if (version) {
			const fullVersion = version.basic + (version.branch !== 'master' ? ` ${version.branch}` : '');
			const commit = version.commitShort;
			const deployDate = moment(version.activation).format('lll');
			const restart = moment(version.lastStart).format('lll');
			versionString =
				`<br>The running version is [${siteName}] ${fullVersion}  @ commit ${commit}` +
				`<br>It was deployed on ${deployDate},` +
				`<br>and last restarted on ${restart}.`;
		}

		const subjectPrefix = `[${siteName}] `;

		const subject = `Report: ${title}`;

		const reportEmail = PrivateSettings.reporter;

		let message = SSR.render('reportEmail', {
			reporter,
			location,
			subject,
			title,
			site: {
				url: Meteor.absoluteUrl(),
				logo: base64PngImageData(PublicSettings.emailLogo),
				name: siteName,
			},
			report: reportMessage,
			versionString,
			timeNow: new Date(),
			userAgent,
		});

		// Template can't handle DOCTYPE header, so we add the thing here.
		const DOCTYPE =
			'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';
		message = DOCTYPE + message;

		const email = {
			from: reportEmail.sender,
			to: reportEmail.recipient,
			subject: subjectPrefix + subject,
			html: juice(message),
		};

		Email.send(email);
	},
	{ simulation: false },
);

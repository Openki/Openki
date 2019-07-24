import { Match } from 'meteor/check';

import Notification from '/imports/notification/notification';
import HtmlTools from '/imports/utils/html-tools';

import Version from '/imports/api/version/version';

if (Meteor.settings.siteEmail) {
	Accounts.emailTemplates.from = Meteor.settings.siteEmail;
}

if (Meteor.settings.public && Meteor.settings.public.siteName) {
	Accounts.emailTemplates.siteName = Meteor.settings.public.siteName;
}


Meteor.methods({
	sendVerificationEmail() {
		Accounts.sendVerificationEmail(this.userId);
	},

	sendEmail(userId, message, options) {
		check(userId, String);
		check(message, String);
		check(options.revealAddress, Boolean);
		check(options.sendCopy, Boolean);
		check(options.courseId, Match.Optional(String));
		check(options.eventId, Match.Optional(String));

		const recipient = Meteor.users.findOne(userId);
		if (!recipient) {
			throw new Meteor.Error(404, 'no such user');
		}
		if (!recipient.acceptsMessages) {
			throw new Meteor.Error(401, 'this user does not accept messages');
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

	report(subject, location, userAgent, report) {
		let reporter = 'A fellow visitor';
		const rootUrl = Meteor.absoluteUrl();
		if (this.userId) {
			const user = Meteor.users.findOne(this.userId);
			if (user) {
				reporter = `<a href='${rootUrl}user/${this.userId}'>${HtmlTools.plainToHtml(user.username)}</a>`;
			}
		}
		moment.locale('en');
		const version = Version.findOne();
		let versionString = '';
		if (version) {
			const fullVersion = version.basic + (version.branch !== 'master' ? ` ${version.branch}` : '');
			const commit = version.commitShort;
			const deployDate = moment(version.activation).format('lll');
			const restart = moment(version.lastStart).format('lll');
			versionString = `<br>The running version is [${Accounts.emailTemplates.siteName}] ${fullVersion}  @ commit ${commit
			}<br>It was deployed on ${deployDate},`
				+ `<br>and last restarted on ${restart}.`;
		}

		SSR.compileTemplate('messageReport', Assets.getText('messages/report.html'));

		Email.send({
			from: 'reporter@mail.openki.net',
			to: 'admins@openki.net',
			subject: `Report: ${subject}`,
			html: SSR.render('messageReport', {
				reporter,
				location,
				subject,
				report,
				versionString,
				timeNow: new Date(),
				userAgent,
			}),
		});
	},

});

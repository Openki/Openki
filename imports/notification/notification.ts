import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Email } from 'meteor/email';
import { SSR } from 'meteor/meteorhacks:ssr';
import { Random } from 'meteor/random';
import { Match, check } from 'meteor/check';
import juice from 'juice';

import { Log } from '/imports/api/log/log';
import { UserModel, Users } from '/imports/api/users/users';

import * as notificationEvent from '/imports/notification/notification.event';
import * as notificationComment from '/imports/notification/notification.comment';
import * as notificationJoin from '/imports/notification/notification.join';
import * as notificationGroupCourse from '/imports/notification/notification.group.course';
import * as notificationPrivateMessage from '/imports/notification/notification.private-message';

import { base64PngImageData } from '/imports/utils/base64-png-image-data';
import { PublicSettings } from '/imports/utils/PublicSettings';

export const Notification = {
	Event: notificationEvent,
	Comment: notificationComment,
	Join: notificationJoin,
	'Group.Course': notificationGroupCourse,
	PrivateMessage: notificationPrivateMessage,
};

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace SendResult {
	/**
	 * Record the result of a notification delivery attempt
	 * @param note notification log-entry
	 * @param unsubToken token that can be used to unsubscribe from further notices
	 * @param sent whether the notification was sent
	 * @param recipient recipient user ID
	 * @param message generated message (or null if we didn't get that far)
	 * @param reason why this log entry was recorded
	 */
	export function record(
		note: { _id: string },
		unsubToken: string | null,
		sent: boolean,
		recipient: string,
		message: any,
		reason: string,
	) {
		check(sent, Boolean);
		check(unsubToken, Match.Maybe(String));
		check(recipient, String);
		check(message, Match.Maybe(Object));
		const entry = {
			sent,
			recipient,
			message,
			reason,
			unsubToken,
		};

		const rel = [note._id, recipient];
		if (unsubToken) {
			rel.push(unsubToken);
		}

		Log.record('Notification.SendResult', rel, entry);
	}
}

/**
 * Handle event notification
 * @param entry Notification.Event log entry to process
 */
export function send(entry: { _id: string; body: { model: string; recipients: string[] } }) {
	// Find out for which recipients sending has already been attempted.
	const concluded: { [recipient: string]: boolean } = {};

	Log.find({
		tr: 'Notification.SendResult',
		rel: entry._id,
	}).forEach((result) => {
		concluded[result.body.recipient] = true;
	});

	const model = (
		Notification as {
			[name: string]: {
				Model(entry: any): {
					accepted(user: UserModel): void;
					vars(userLocale: string, user: UserModel, unsubToken: string): Record<string, any>;
					template: string;
				};
			};
		}
	)[entry.body.model].Model(entry);

	entry.body.recipients.forEach((recipientId: string) => {
		if (!concluded[recipientId]) {
			let mail = null;
			let unsubToken = null;

			try {
				const user = Users.findOne(recipientId);

				if (!user) {
					throw new Error(`User not found for ID '${recipientId}'`);
				}

				model.accepted(user);

				const address = user.emailAddress();

				const { username } = user;
				const userLocale = user.locale || 'en';

				const { siteName } = Accounts.emailTemplates;
				const subjectPrefix = `[${siteName}] `;

				unsubToken = Random.secret();
				const vars = model.vars(userLocale, user, unsubToken);

				const fromAddress = vars.fromAddress || Accounts.emailTemplates.from;

				// For everything that is global use siteName from global settings, eg. unsubscribe
				vars.siteName = siteName;
				// For everything context specifig us customSiteName from the region, eg. courses
				vars.customSiteName = vars.customSiteName || vars.siteName;
				const emailLogo = vars.customEmailLogo || PublicSettings.emailLogo;
				vars.site = {
					url: vars.customSiteUrl || Meteor.absoluteUrl(),
					logo: emailLogo.startsWith('data:image/') ? emailLogo : base64PngImageData(emailLogo),
					name: vars.customSiteName || vars.siteName,
				};
				vars.locale = userLocale;
				vars.username = username;
				let message = SSR.render(model.template, vars);

				// Template can't handle DOCTYPE header, so we add the thing here.
				const DOCTYPE =
					'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';
				message = DOCTYPE + message;

				mail = {
					from: fromAddress,
					to: address || undefined,
					subject: subjectPrefix + vars.subject,
					html: juice(message),
				};

				Email.send(mail);

				SendResult.record(entry, unsubToken, true, recipientId, mail, 'success');
			} catch (e) {
				let reason = e;
				if (typeof e === 'object' && 'toJSON' in e) {
					reason = e.toJSON();
				}
				SendResult.record(entry, unsubToken, false, recipientId, mail, reason);
			}
		}
	});
}

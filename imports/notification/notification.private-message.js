import { Match, check } from 'meteor/check';
import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { i18n } from '/imports/startup/both/i18next';

import { Courses } from '/imports/api/courses/courses';
import { Log } from '/imports/api/log/log';
import { Users } from '/imports/api/users/users';
import { Regions } from '/imports/api/regions/regions';
/** @typedef {import('/imports/api/regions/regions').RegionModel} RegionModel */

import * as HtmlTools from '/imports/utils/html-tools';
import * as StringTools from '/imports/utils/string-tools';
import * as UserPrivilegeUtils from '../utils/user-privilege-utils';
import { getSiteName } from '../utils/getSiteName';

/** @typedef {import('../api/users/users').UserModel} UserModel */

const notificationPrivateMessage = {};

/**
 * Record the intent to send a private message
 * @param {string} senderId id of the user that sends the message
 * @param {string} recipientId id of the intended recipient
 * @param {string} message the message to transmit
 * @param {boolean} revealSenderAddress include email-address of sender in message
 * @param {boolean} sendCopyToSender send a copy of the message to the author
 * @param {{course?: string, event?: string}} context dictionary with
 * context ID (course, venue, &c.)
 */
notificationPrivateMessage.record = function (
	senderId,
	recipientId,
	message,
	revealSenderAddress,
	sendCopyToSender,
	context,
) {
	check(senderId, String);
	check(recipientId, String);
	check(message, String);
	check(revealSenderAddress, Boolean);
	check(sendCopyToSender, Boolean);

	const optionalId = Match.Optional(String);
	check(context, {
		course: optionalId,
		event: optionalId,
	});

	const recipients = [recipientId];
	if (sendCopyToSender) {
		const sender = Users.findOne(senderId);
		if (!sender) {
			throw new Meteor.Error(404, 'Sender not found');
		}

		if (sender.hasEmail()) {
			recipients.push(senderId);
		} else {
			throw new Meteor.Error(404, 'Sender has no email address');
		}
	}

	const contextRel = Object.values(context);

	const rel = [senderId, recipientId, ...contextRel].filter((id) => id);

	const body = {
		message,
		sender: senderId,
		recipients,
		targetRecipient: recipientId,
		revealSenderAddress,
		model: 'PrivateMessage',
		context,
	};

	Log.record('Notification.Send', rel, body);
};

notificationPrivateMessage.Model = function (entry) {
	const { body } = entry;
	const sender = Users.findOne(body.sender);
	const targetRecipient = Users.findOne(body.targetRecipient);

	return {
		/**
		 * @param {UserModel} actualRecipient
		 */
		accepted(actualRecipient) {
			if (
				!actualRecipient.allowPrivateMessages &&
				!UserPrivilegeUtils.privileged(sender, 'admin')
			) {
				throw new Error('User wishes to not receive private messages from users');
			}

			if (!actualRecipient.hasEmail()) {
				throw new Error('Recipient has no email address registered');
			}
		},

		/**
		 * @param {string} lng
		 * @param {UserModel} actualRecipient
		 * @param {string} unsubToken
		 */
		vars(lng, actualRecipient, unsubToken) {
			if (!sender) {
				throw new Error('Sender does not exist (0.o)');
			}
			if (!targetRecipient) {
				throw new Error('targetRecipient does not exist (0.o)');
			}

			const subjectvars = { SENDER: StringTools.truncate(sender.username, 10), lng };
			// prettier-ignore
			const subject = i18n('notification.privateMessage.mail.subject', 'Private message from {SENDER}', subjectvars);
			const htmlizedMessage = HtmlTools.plainToHtml(entry.body.message);

			// Find out whether this is the copy sent to the sender.
			const senderCopy = sender._id === actualRecipient._id;

			/** @type {RegionModel | undefined}  */
			let region;
			if (actualRecipient.profile?.regionId) {
				region = Regions.findOne(actualRecipient.profile?.regionId);
			}

			const emailLogo = region?.custom?.emailLogo;
			const siteName = getSiteName(region);

			const vars = {
				unsubLink: Router.url('profilePrivateMessagesUnsubscribe', { token: unsubToken }),
				sender,
				senderLink: Router.url('userprofile', sender, { query: 'campaign=privateMessage' }),
				subject,
				message: htmlizedMessage,
				senderCopy,
				recipientName: targetRecipient.username,
				customSiteUrl: `${Meteor.absoluteUrl()}?campaign=privateMessage`,
				customSiteName: siteName,
				customEmailLogo: emailLogo,
			};

			if (!senderCopy && body.revealSenderAddress) {
				const senderAddress = sender.verifiedEmailAddress();
				if (senderAddress) {
					vars.fromAddress = senderAddress;
				} else {
					throw new Meteor.Error(400, 'no verified email address');
				}
			}

			const courseContextId = body.context.course;
			if (courseContextId) {
				const course = Courses.findOne(courseContextId);
				if (!course) {
					throw new Meteor.Error(404, 'course not found');
				}
				vars.courseName = course.name;
				vars.courseLink = Router.url('showCourse', course, {
					query: 'campaign=privateMessage',
				});
			}

			return vars;
		},
		template: 'notificationPrivateMessageEmail',
	};
};

export default notificationPrivateMessage;

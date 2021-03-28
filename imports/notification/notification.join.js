import { Match, check } from 'meteor/check';
import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { mf } from 'meteor/msgfmt:core';

import Courses from '/imports/api/courses/courses';
import Regions from '/imports/api/regions/regions';
import Log from '/imports/api/log/log';

import { HtmlTools } from '/imports/utils/html-tools';
import { StringTools } from '/imports/utils/string-tools';

/** @typedef {import('../api/users/users').UserModel} UserModel */

const notificationJoin = {};

/**
  * Record the intent to send join notifications
  * @param {string} courseId ID for the CourseDiscussions collection
  * @param {string} participantId ID of the user that joined
  * @param {string} newRole new role of the participant
  * @param {string} [message] Optional message of the new participant
  */
notificationJoin.record = function (courseId, participantId, newRole, message) {
	check(courseId, String);
	check(participantId, String);
	check(newRole, String);
	check(message, Match.Optional(String));

	const course = Courses.findOne(courseId);
	if (!course) {
		throw new Meteor.Error(`No course entry for ${courseId}`);
	}

	const participant = Meteor.users.findOne(participantId);
	if (!course) {
		throw new Meteor.Error(`No user entry for ${participantId}`);
	}

	const body = {};
	body.courseId = course._id;
	body.participantId = participant._id;
	body.recipients = course.membersWithRole('team').map((m) => m.user);

	// Don't send to new member, they know
	body.recipients = body.recipients.filter((r) => r !== participantId);

	body.newRole = newRole;

	body.message = message;

	body.model = 'Join';

	Log.record('Notification.Send', [course._id, participant._id], body);
};

notificationJoin.Model = function (entry) {
	const { body } = entry;
	const course = Courses.findOne(body.courseId);
	const newParticipant = Meteor.users.findOne(body.participantId);

	return {
		/**
		 * @param {UserModel} actualRecipient
		 */
		accepted(actualRecipient) {
			if (actualRecipient.notifications === false) {
				throw new Error('User wishes to not receive automated notifications');
			}

			if (!actualRecipient.hasEmail()) {
				throw new Error('Recipient has no email address registered');
			}
		},

		/**
		 * @param {string} userLocale
		 * @param {UserModel} actualRecipient
		 * @param {string} unsubToken
		 */
		vars(userLocale, actualRecipient, unsubToken) {
			if (!newParticipant) {
				throw new Error('New participant does not exist (0.o)');
			}
			if (!course) {
				throw new Error('Course does not exist (0.o)');
			}

			const roleTitle = mf(`roles.${body.newRole}.short`, {}, undefined, userLocale);
			const subjectvars = {
				COURSE: StringTools.truncate(course.name, 10),
				USER: StringTools.truncate(newParticipant.username, 50),
				ROLE: roleTitle,
			};
			const subject = mf('notification.join.mail.subject', subjectvars, '{USER} joined {COURSE}: {ROLE}', userLocale);

			const figures = ['host', 'mentor', 'participant']
				.filter((role) => course.roles.includes(role))
				.map((role) => ({
					role: StringTools.capitalize(mf(`roles.${role}.short`, {}, undefined, userLocale)),
					count: course.membersWithRole(role).length,
				}));

			let siteName;
			let mailLogo;
			if (course.region) {
				const region = Regions.findOne(course.region);
				siteName = region?.custom?.siteName;
				mailLogo = region?.custom?.mailLogo;
			}
			siteName = siteName || Meteor.settings.public.siteName;

			return (
				{
					unsubLink: Router.url('profile.notifications.unsubscribe', { token: unsubToken }),
					course,
					newParticipant,
					courseLink: Router.url('showCourse', course, { query: 'campaign=joinNotify' }),
					subject,
					memberCount: course.members.length,
					roleTitle,
					message: HtmlTools.plainToHtml(body.message),
					figures,
					customSiteUrl: `${Meteor.absoluteUrl()}?campaign=joinNotify`,
					customSiteName: siteName,
					customMailLogo: mailLogo,
				}
			);
		},
		template: 'notificationJoinMail',
	};
};

export default notificationJoin;

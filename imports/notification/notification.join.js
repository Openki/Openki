import { Match, check } from 'meteor/check';
import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import i18next from 'i18next';

import { Courses } from '/imports/api/courses/courses';
import { Regions } from '/imports/api/regions/regions';
/** @typedef {import('/imports/api/regions/regions').RegionModel} RegionModel */
import { Log } from '/imports/api/log/log';
import { Users } from '/imports/api/users/users';

import * as HtmlTools from '/imports/utils/html-tools';
import * as StringTools from '/imports/utils/string-tools';
import { getSiteName } from '../utils/getSiteName';

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

	const participant = Users.findOne(participantId);
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
	const newParticipant = Users.findOne(body.participantId);

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
		 * @param {string} lng
		 * @param {UserModel} _actualRecipient
		 * @param {string} unsubToken
		 */
		vars(lng, _actualRecipient, unsubToken) {
			if (!newParticipant) {
				throw new Error('New participant does not exist (0.o)');
			}
			if (!course) {
				throw new Error('Course does not exist (0.o)');
			}

			const roleTitle = i18next.t(`roles.${body.newRole}.short`, { lng });
			const subjectvars = {
				COURSE: StringTools.truncate(course.name, 10),
				USER: StringTools.truncate(newParticipant.username, 50),
				ROLE: roleTitle,
				lng,
			};

			// prettier-ignore
			const subject = i18next.t('notification.join.mail.subject', '{USER} joined {COURSE}: {ROLE}', subjectvars);

			const figures = ['host', 'mentor', 'participant']
				.filter((role) => course.roles.includes(role))
				.map((role) => ({
					role: StringTools.capitalize(i18next.t(`roles.${role}.short`, { lng })),
					count: course.membersWithRole(role).length,
				}));

			/** @type {RegionModel | undefined}  */
			let region;
			if (course.region) {
				region = Regions.findOne(course.region);
			}
			const emailLogo = region?.custom?.emailLogo;
			const siteName = getSiteName(region);

			return {
				unsubLink: Router.url('profileNotificationsUnsubscribe', { token: unsubToken }),
				course,
				newParticipant,
				courseLink: Router.url('showCourse', course, { query: 'campaign=joinNotify' }),
				subject,
				memberCount: course.members.length,
				roleTitle,
				message: HtmlTools.plainToHtml(body.message),
				// For Team members when a mentor joins, add a hint for possible collaboration or
				// invite into team
				appendCollaborationHint: body.newRole === 'mentor',
				figures,
				customSiteUrl: `${Meteor.absoluteUrl()}?campaign=joinNotify`,
				customSiteName: siteName,
				customEmailLogo: emailLogo,
			};
		},
		template: 'notificationJoinEmail',
	};
};

export default notificationJoin;

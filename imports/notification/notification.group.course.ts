import { check } from 'meteor/check';
import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { i18n } from '/imports/startup/both/i18next';
import { Spacebars } from 'meteor/spacebars';

import { Courses } from '/imports/api/courses/courses';
import { Groups } from '/imports/api/groups/groups';
import { RegionModel, Regions } from '/imports/api/regions/regions';
import { Log } from '/imports/api/log/log';
import Users, { UserModel } from '/imports/api/users/users';

import * as StringTools from '/imports/utils/string-tools';
import { getSiteName } from '../utils/getSiteName';

interface Body {
	courseId: string;
	recipients: string[];
	model: string;
}

/**
 * Record the intent to send join notifications
 * @param courseId ID for the CourseDiscussions collection
 */
export function record(courseId: string) {
	check(courseId, String);

	const course = Courses.findOne(courseId);
	if (!course) {
		throw new Meteor.Error(`No course entry for ${courseId}`);
	}

	const recipients = [
		...new Set(
			Groups.find({ _id: { $in: course.groupOrganizers } })
				.map((g) => g.members)
				.flat(),
		),
	];

	const body: Body = {
		courseId: course._id,

		// Don't send to creater
		recipients: recipients.filter((r) => r !== course.createdby),
		model: 'Group.Course',
	};

	Log.record('Notification.Send', [course._id], body);
}

export function Model(entry: { body: Body }) {
	const { body } = entry;
	const course = Courses.findOne(body.courseId);
	if (!course) {
		throw new Error('Course does not exist (0.o)');
	}
	const groups = Groups.find({ _id: { $in: course.groupOrganizers } }).fetch();
	if (!(groups.length > 0)) {
		throw new Error('Groups does not exist (0.o)');
	}

	const creater = Users.findOne(course.createdby);
	if (!creater) {
		throw new Error('Creater does not exist (0.o)');
	}

	return {
		accepted(actualRecipient: UserModel) {
			if (actualRecipient.notifications === false) {
				throw new Error('User wishes to not receive automated notifications');
			}
			if (!actualRecipient.hasEmail()) {
				throw new Error('Recipient has no email address registered');
			}
		},

		vars(lng: string, actualRecipient: UserModel, unsubToken: string) {
			const recipientsGroups = groups.filter((g) => g.members.includes(actualRecipient._id));

			const subjectvars = {
				COURSE: StringTools.truncate(course.name, 10),
				GROUPS: StringTools.truncate(recipientsGroups.map((g) => g.short).join(', '), 30),
				lng,
			};

			const subject = i18n(
				'notification.group.course.mail.subject',
				'{COURSE} proposed in {GROUPS}',
				subjectvars,
			);

			let region: RegionModel | undefined;
			if (course.region) {
				region = Regions.findOne(course.region);
			}
			const emailLogo = region?.custom?.emailLogo;
			const siteName = getSiteName(region);

			const courseLink = Router.url('showCourse', course, { query: 'campaign=groupCourseNotify' });
			return {
				unsubLink: Router.url('profileNotificationsUnsubscribe', { token: unsubToken }),
				course: Spacebars.SafeString(`<a href="${courseLink}">${course.name}</a>`),
				courseLink,
				courseDescription: course.description,
				groups: Spacebars.SafeString(
					recipientsGroups
						.map(
							(g) =>
								`<a href="${Router.url('groupDetails', g, {
									query: 'campaign=groupCourseNotify',
								})}">${g.name}</a>`,
						)
						.join(', '),
				),
				creater,
				subject,
				customSiteUrl: `${Meteor.absoluteUrl()}?campaign=groupCourseNotify`,
				customSiteName: siteName,
				customEmailLogo: emailLogo,
			};
		},
		template: 'notificationGroupCourseEmail',
	};
}

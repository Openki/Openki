import { check } from 'meteor/check';
import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { i18n } from '/imports/startup/both/i18next';
import { _ } from 'meteor/underscore';

import { CourseDiscussions } from '/imports/api/course-discussions/course-discussions';
import { CourseModel, Courses } from '/imports/api/courses/courses';
import { RegionModel, Regions } from '/imports/api/regions/regions';
import { UserModel, Users } from '/imports/api/users/users';
import { Log } from '/imports/api/log/log';

import * as StringTools from '/imports/utils/string-tools';
import { getSiteName } from '/imports/utils/getSiteName';

interface Body {
	commentId: string;
	recipients: string[];
	model: string;
}

/**
 * Record the intent to send event notifications
 * @param commentId ID for the CourseDiscussions collection
 */
export function record(commentId: string) {
	check(commentId, String);
	const comment = CourseDiscussions.findOne(commentId);
	if (!comment) {
		throw new Meteor.Error(`No CourseDiscussion entry for ${commentId}`);
	}

	const course = Courses.findOne(comment.courseId);
	if (!course) {
		throw new Meteor.Error(`No course entry for ${commentId}`);
	}

	const body = {} as Body;
	body.commentId = comment._id;

	if (comment.notifyAll) {
		body.recipients = course.members.map((m) => m.user);
	} else {
		let recipients = [];

		recipients = course.membersWithRole('team').map((m) => m.user);

		// All participants in the thread are notified.
		const threadId = comment.parentId;
		if (threadId) {
			const threadSelector = {
				$or: [{ _id: threadId }, { parentId: threadId }],
			};

			CourseDiscussions.find(threadSelector).forEach((threadComment) => {
				const partId = threadComment.userId;
				if (partId) {
					recipients.push(partId);
				}
			});
		}

		// Don't send to author of comment
		if (comment.userId) {
			recipients = recipients.filter((r) => r !== comment.userId);
		}

		body.recipients = _.uniq(recipients);
	}

	body.model = 'Comment';

	Log.record('Notification.Send', [course._id, comment._id], body);
}

export function Model(entry: { body: Body }) {
	const comment = CourseDiscussions.findOne(entry.body.commentId);

	let course: CourseModel | undefined;
	let commenter: UserModel | undefined;
	let commenterName: string | undefined;

	if (comment) {
		course = Courses.findOne(comment.courseId);
		if (comment.userId) {
			commenter = Users.findOne(comment.userId);
		}
		if (commenter) {
			commenterName = commenter.username;
		}
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

		vars(userLocale: string, _actualRecipient: UserModel, unsubToken: string) {
			if (!comment) {
				throw new Error('Comment does not exist (0.o)');
			}
			if (!course) {
				throw new Error('Course does not exist (0.o)');
			}

			const subjectvars = {
				COURSE: StringTools.truncate(course.name, 10),
				TITLE: StringTools.truncate(comment.title, 50),
				COMMENTER: '',
				lng: userLocale,
			};

			let subject;
			if (commenter) {
				subjectvars.COMMENTER = StringTools.truncate(commenterName || '', 20);
				subject = i18n(
					'notification.comment.mail.subject',
					'Comment on {COURSE} by {COMMENTER}: {TITLE}',
					subjectvars,
				);
			} else {
				subject = i18n(
					'notification.comment.mail.subject.anon',
					'Anonymous comment on {COURSE}: {TITLE}',
					subjectvars,
				);
			}

			let region: RegionModel | undefined;
			if (course.region) {
				region = Regions.findOne(course.region);
			}
			const emailLogo = region?.custom?.emailLogo;
			const siteName = getSiteName(region);

			return {
				unsubLink: Router.url('profileNotificationsUnsubscribe', { token: unsubToken }),
				course,
				courseLink: Router.url('showCourse', course, {
					query: `select=${comment._id}&campaign=commentNotify`,
				}),
				subject,
				comment,
				commenter,
				commenterLink: `${Meteor.absoluteUrl(
					`user/${comment.userId}/${commenterName}`,
				)}?campaign=commentNotify`,
				commenterName,
				customSiteUrl: `${Meteor.absoluteUrl()}?campaign=commentNotify`,
				customSiteName: siteName,
				customEmailLogo: emailLogo,
			};
		},
		template: 'notificationCommentEmail',
	};
}

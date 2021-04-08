import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';

import { Courses } from '/imports/api/courses/courses';
import CourseDiscussions from '/imports/api/course-discussions/course-discussions';
import CourseDiscussionUtils from '/imports/utils/course-discussion-utils';
import Notification from '/imports/notification/notification';
import { StringTools } from '/imports/utils/string-tools';
import { HtmlTools } from '/imports/utils/html-tools';
import { HasRoleUser } from '/imports/utils/course-role-utils';

/** @typedef {import('./course-discussions').CourseDiscussionEnity} CourseDiscussionEnity */

/**
 * @param {{ title: string; text: string; }} comment
 */
const sanitizeComment = (comment) => {
	const saneTitle = StringTools.saneTitle(comment.title).substr(0, 200).trim();

	// String-truncating HTML may leave a broken tag at the end
	// The sanitizer will have to clean the mess.
	const unsaneHtml = comment.text.substr(0, 640 * 1024).trim();
	const saneHtml = HtmlTools.saneHtml(unsaneHtml);

	return { title: saneTitle, text: saneHtml };
};

Meteor.methods({
	/**
	 * @param {object} comment
	 * @param {string} comment.courseId
	 * @param {string} [comment.parentId]
	 * @param {string} comment.title
	 * @param {string} comment.text
	 * @param {boolean} comment.anon
	 * @param {boolean} [comment.notifyAll]
	 */
	'courseDiscussion.postComment'(comment) {
		check(comment, {
			courseId: String,
			parentId: Match.Optional(String),
			title: String,
			text: String,
			anon: Boolean,
			notifyAll: Match.Optional(Boolean),
		});

		/** @type {CourseDiscussionEnity & {saving?: boolean}} */
		const saneComment = sanitizeComment(comment);

		if (!CourseDiscussions.validComment(saneComment.text)) {
			throw new Meteor.Error(400, 'Invalid comment');
		}

		const course = Courses.findOne(comment.courseId);
		if (!course) {
			throw new Meteor.Error(404, 'course not found');
		}
		saneComment.courseId = course._id;

		const userId = Meteor.userId();
		if (userId && !comment.anon) {
			saneComment.userId = userId;
			saneComment.notifyAll = comment.notifyAll
							&& HasRoleUser(course.members, 'team', userId);
		}

		const now = new Date();
		saneComment.time_created = now;
		saneComment.time_updated = now;

		if (comment.parentId) {
			const parentComment = CourseDiscussions.findOne(comment.parentId);

			if (!parentComment) {
				throw new Meteor.Error(404, 'parent comment not found');
			}

			if (parentComment.courseId !== comment.courseId) {
				// I could try to mend this but why should I?
				throw new Meteor.Error(400, 'Course mismatch');
			}

			// No nesting beyond one level
			if (parentComment.parentId) {
				throw new Meteor.Error(400, 'Nesting error');
			}

			saneComment.parentId = parentComment._id;
		}

		if (this.isSimulation) {
			saneComment.saving = true;
		}

		const commentId = CourseDiscussions.insert(saneComment);

		Notification.Comment.record(commentId);

		return commentId;
	},


	/**
	 * @param {{ _id: string; title: string; text: string; }} comment
	 */
	'courseDiscussion.editComment'(comment) {
		check(comment, {
			_id: String,
			title: String,
			text: String,
		});

		/** @type {CourseDiscussionEnity} */
		const update = sanitizeComment(comment);

		const originalComment = CourseDiscussions.findOne(comment._id);
		if (!originalComment) {
			throw new Meteor.Error(404, 'no such comment');
		}

		const user = Meteor.user();
		if (!CourseDiscussionUtils.mayEditPost(user, originalComment)) {
			throw new Meteor.Error(401, 'you cant');
		}

		update.time_updated = new Date();

		CourseDiscussions.update(originalComment._id, { $set: update });
	},


	/**
	 * @param {string} commentId
	 */
	'courseDiscussion.deleteComment'(commentId) {
		check(commentId, String);

		const user = Meteor.user();
		if (!user) {
			throw new Meteor.Error(401, 'please log in');
		}

		const comment = CourseDiscussions.findOne(commentId);
		if (!comment) {
			throw new Meteor.Error(404, 'no such comment');
		}

		const course = Courses.findOne(comment.courseId);

		if (!course) {
			throw new Meteor.Error(401, 'delete not permitted');
		}

		if (!CourseDiscussionUtils.mayDeletePost(user, course, comment)) {
			throw new Meteor.Error(401, 'delete not permitted');
		}

		CourseDiscussions.remove({ _id: comment._id });
		CourseDiscussions.remove({ parentId: comment._id });
	},
});

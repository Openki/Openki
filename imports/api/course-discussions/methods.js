import { Meteor } from 'meteor/meteor';

import Courses from '/imports/api/courses/courses.js';
import CourseDiscussions from '/imports/api/course-discussions/course-discussions.js';

import CourseDiscussionUtils from '/imports/utils/course-discussion-utils.js';
import Notification from '/imports/notification/notification.js';
import StringTools from '/imports/utils/string-tools.js';
import HtmlTools from '/imports/utils/html-tools.js';
import { HasRoleUser } from '/imports/utils/course-role-utils.js';

const sanitizeComment = (comment) => {
	const saneTitle = StringTools.saneTitle(comment.title).substr(0, 200).trim();

	// String-truncating HTML may leave a broken tag at the end
	// The sanitizer will have to clean the mess.
	const unsaneHtml = comment.text.substr(0, 640*1024).trim();
	const saneHtml = HtmlTools.saneHtml(unsaneHtml);

	return { title: saneTitle, text: saneHtml };
};

Meteor.methods({
	'courseDiscussion.postComment': function(comment) {
		check(comment, {
			courseId: String,
			parentId: Match.Optional(String),
			title: String,
			text: String,
			anon: Boolean,
			notifyAll: Match.Optional(Boolean),
		});

		var saneComment = sanitizeComment(comment);

		if (!CourseDiscussions.validComment(saneComment.text)) {
			throw new Meteor.Error(400, "Invalid comment");
		}

		var course = Courses.findOne(comment.courseId);
		if (!course) {
			throw new Meteor.Error(404, "course not found");
		}
		saneComment.courseId = course._id;

		var userId = Meteor.userId();
		if (userId && !comment.anon) {
			saneComment.userId = userId;
			saneComment.notifyAll = comment.notifyAll
			                     && HasRoleUser(course.members, 'team', userId);
		}

		var now = new Date();
		saneComment.time_created = now;
		saneComment.time_updated = now;

		if (comment.parentId) {
			var parentComment = CourseDiscussions.findOne(comment.parentId);

			if (!parentComment) {
				throw new Meteor.Error(404, "parent comment not found");
			}

			if (parentComment.courseId !== comment.courseId) {

				// I could try to mend this but why should I?
				throw new Meteor.Error(400, "Course mismatch");
			}

			// No nesting beyond one level
			if (parentComment.parentId) {

				throw new Meteor.Error(400, "Nesting error");
			}

			saneComment.parentId = parentComment._id;
		}

		if (this.isSimulation) {
			saneComment.saving = true;
		}

		var commentId = CourseDiscussions.insert(saneComment);

		Notification.Comment.record(commentId);

		return commentId;
	},


	'courseDiscussion.editComment': function(comment) {
		check(comment, {
			_id: String,
			title: String,
			text: String
		});

		var update = sanitizeComment(comment);

		var originalComment = CourseDiscussions.findOne(comment._id);
		if (!originalComment) throw new Meteor.error(404, "no such comment");

		var user = Meteor.user();
		if (!CourseDiscussionUtils.mayEditPost(user, originalComment)) {
			throw new Meteor.error(401, "you cant");
		}

		update.time_updated = new Date();

		CourseDiscussions.update(originalComment._id, { $set: update });
	},


	'courseDiscussion.deleteComment': function(commentId) {
		check(commentId, String);

		var user = Meteor.user();
		if (!user) {
			throw new Meteor.Error(401, "please log in");
		}

		var comment = CourseDiscussions.findOne(commentId);
		if (!comment) {
			throw new Meteor.error(404, "no such comment");
		}

		var course = Courses.findOne(comment.courseId);

		if (!course) {
			throw new Meteor.Error(401, "delete not permitted");
		}

		if( !CourseDiscussionUtils.mayDeletePost(user, course, comment) ) {
			throw new Meteor.Error(401, "delete not permitted");
		}

		CourseDiscussions.remove({ _id: comment._id });
		CourseDiscussions.remove({ parentId: comment._id });
	}
});

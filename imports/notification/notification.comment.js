export default notificationComment = {};
import Log from '/imports/api/log/log.js';
import StringTools from '/imports/utils/string-tools.js';
import Courses from '/imports/api/courses/courses.js';
import CourseDiscussions from '/imports/api/course-discussions/course-discussions.js';

/** Record the intent to send event notifications
  *
  * @param      {ID} commentID - ID for the CourseDiscussions collection
  */
notificationComment.record = function(commentId) {
	check(commentId, String);
	var comment = CourseDiscussions.findOne(commentId);
	if (!comment) throw new Meteor.Error("No CourseDiscussion entry for " + commentId);

	var course = Courses.findOne(comment.courseId);
	if (!course) throw new Meteor.Error("No course entry for " + commentId);

	var body = {};
	body.commentId = comment._id;

	if (comment.notifyAll) {
		body.recipients = _.pluck(course.members, 'user');
	} else {
		let recipients = [];
		
		recipients = _.pluck(course.membersWithRole('team'), 'user');

		// All participants in the thread are notified.
		const threadId = comment.parentId;
		if (threadId) {
			const threadSelector =
				{ $or:
					[ { _id: threadId }
					, { parentId: threadId }
					]
				};

			CourseDiscussions.find(threadSelector).forEach(threadComment => {
				const partId = threadComment.userId;
				if (partId) recipients.push(partId);
			});
		}

		// Don't send to author of comment
		if (comment.userId) {
			recipients = recipients.filter(r => r !== comment.userId);
		}

		body.recipients = _.uniq(recipients);
	}

	body.model = 'Comment';

	Log.record('Notification.Send', [course._id, comment._id], body);
};


notificationComment.Model = function(entry) {
	var comment = CourseDiscussions.findOne(entry.body.commentId);
	var course = false;
	var commenter = false;
	var commenterName = false;

	if (comment) {
		course = Courses.findOne(comment.courseId);
		if (comment.userId) {
			commenter = Meteor.users.findOne(comment.userId);
		}
		if (commenter) {
			commenterName = commenter.username;
		}
	}

	return {
		vars: function(userLocale) {
			if (!comment) throw "Comment does not exist (0.o)";
			if (!course) throw "Course does not exist (0.o)";

			var subjectvars =
				{ COURSE: StringTools.truncate(course.name, 10)
				, TITLE: StringTools.truncate(comment.title, 50)
				};

			var subject;
			if (commenter) {
				subjectvars.COMMENTER = StringTools.truncate(commenterName, 20);
				subject = mf('notification.comment.mail.subject', subjectvars, "Comment on {COURSE} by {COMMENTER}: {TITLE}", userLocale);
			} else {
				subject = mf('notification.comment.mail.subject.anon', subjectvars, "Anonymous comment on {COURSE}: {TITLE}", userLocale);
			}

			return (
			    { course: course
				, courseLink: Router.url('showCourse', course, { query: 'select='+comment._id })
				, subject: subject
				, comment: comment
				, commenter: commenter
				, commenterName: commenterName
				}
			);
		},
		template: "notificationCommentMail"
	};
};

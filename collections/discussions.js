import '/imports/notification/Notification.js';

// ======== DB-Model: ========
// "_id"          -> ID
// "title"        -> String
// "text"         -> String
// "userId"       -> ID_users undefined if anon comment
// "courseId"     -> ID_Courses
// "time_created" -> Date
// "time_updated" -> Date
// "parentId"     -> ID_CourseDiscussions  (optional)
// ===========================

CourseDiscussions = new Meteor.Collection("CourseDiscussions");


mayDeletePost = function(user, course,post){
	if (!user) return false;
	return user && (privileged(user, 'admin') || hasRoleUser(course.members, 'team', user._id) || ( post.userId == user._id ));
};

mayEditPost = function(user, post){
	if (!user) return false;
	return user && post.userId == user._id;
};

var sanitizeComment = function(comment) {
	return {
		title: saneText(comment.title).substr(0, 200).trim(),
		text: saneText(comment.text).substr(0, 640*1024).trim(),
	};
};

CourseDiscussions.validComment = function(text) {
	return text.trim().length > 0;
};

Meteor.methods({
	postComment: function(comment) {
		check(comment, {
			courseId: String,
			parentId: Match.Optional(String),
			title: String,
			text: String,
			anon: Boolean,
		});

		var saneComment = sanitizeComment(comment);

		if (!CourseDiscussions.validComment(saneComment.text)) {
			throw new Meteor.Error(400, "Invalid comment");
		}

		var user = Meteor.user();
		if (user && !comment.anon) {
			saneComment.userId = user._id;
		}

		var now = new Date();
		saneComment.time_created = now;
		saneComment.time_updated = now;

		var course = Courses.findOne(comment.courseId);
		if (!course) {
			throw new Meteor.Error(404, "course not found");
		}
		saneComment.courseId = course._id;

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

		var commentId = CourseDiscussions.insert(saneComment);

		Notification.Comment.record(commentId);

		return commentId;
	},


	editComment: function(comment) {
		check(comment, {
			_id: String,
			title: String,
			text: String
		});

		var update = sanitizeComment(comment);

		var originalComment = CourseDiscussions.findOne(comment._id);
		if (!originalComment) throw new Meteor.error(404, "no such comment");

		var user = Meteor.user();
		if (!mayEditPost(user, originalComment)) throw new Meteor.error(401, "you cant");

		update.time_updated = new Date();

		CourseDiscussions.update(originalComment._id, { $set: update });
	},


	deleteComment: function(commentId) {
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

		if( !mayDeletePost(user, course, comment) ) {
			throw new Meteor.Error(401, "delete not permitted");
		}

		CourseDiscussions.remove({ _id: comment._id });
		CourseDiscussions.remove({ parentId: comment._id });
	}
});

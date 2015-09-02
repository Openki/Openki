// ======== DB-Model: ========
// "_id" -> ID
// "title" -> string
// "text" -> string
// "user_ID" -> ID_users
// "course_ID" -> ID_Courses
// "time_created" -> timestamp
// "time_updated" -> timestamp
// "parent_ID" -> ID_CourseDiscussions  (optional)
// ===========================

CourseDiscussions = new Meteor.Collection("CourseDiscussions");


Meteor.methods({
	postComment: function(comment, anon) {
		check(comment, {
			course_ID: String,
		    parent_ID: Match.Optional(String),
			title: String,
			text: String
		});
		
		var user = Meteor.user()
		if (user && !anon) {
			comment.user_ID = user._id;
		}
		
		comment.time_created = new Date();
		
		var course = Courses.findOne(comment.course_ID);
		if (!course) {
			throw new Meteor.Error(404, "course not found");
		}
		
		if (comment.parent_ID) {
			var parentComment = CourseDiscussions.findOne(comment.parent_ID);
			if (!parentComment) {
				throw new Meteor.Error(404, "parent comment not found");
			}
			
			if (parentComment.course_ID !== comment.course_ID) {
				// I could try to mend this but why should I?
				throw new Meteor.Error(400, "Course mismatch"); 
			}
			
			// No nesting beyond one level
			if (parentComment.parent_ID) {
				throw new Meteor.Error(400, "Nesting error"); 
			}
		}
		
		comment.title = saneText(comment.title).substr(0, 200);
		comment.text = htmlize(comment.text.substr(0, 640*1024).trim());
		
		var commentId = CourseDiscussions.insert(comment);
		
		return commentId;
	},

/*  /////////////////////////////////////////// TODO: fix comment-editing ////////////////
	
	editComment: function(comment, commentId) {
		check(comment, {
			course_ID: String,
		    parent_ID: Match.Optional(String),
			title: String,
			text: String,
		});
		
		var user = Meteor.user();
		if (!user) {
			if (Meteor.is_client) {
				pleaseLogin();
				return;
			} else {
				throw new Meteor.Error(401, "please log in");
			}
		}
		
		comment.user_ID = user._id;
		comment.time_created = new Date();
		
		var course = Courses.findOne(comment.course_ID);
		if (!course) {
			throw new Meteor.Error(404, "course not found");
		}
		
		comment.title = saneText(comment.title).substr(0, 200);
		comment.text = htmlize(comment.text.substr(0, 640*1024).trim());
		
		var _commentId = CourseDiscussions.update( { _id:commentId }, comment );
		
		// HACK update course so time_lastchange is updated
		Meteor.call("save_course", course._id, {});
		
		return _commentId;
	}

*/
	
});
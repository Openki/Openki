//load template-content
Template.discussion.post = function() {
	//get all first-level posts
	var posts = CourseDiscussions.find({
		course_ID: this._id,
		parent_ID: { $exists: false },
		},
		{sort: {time_updated: -1, time_created: -1}}
	);
	var ordered_posts = [];
	// loop over first-level post, search each post for comments, order by most recent
	posts.forEach(function (post){
		ordered_posts.push(post);
		console.log("post: "+post.title+"/ parent_id: "+post.parent_ID);
		var comments = CourseDiscussions.find({parent_ID: post._id}, {sort: {time_created: -1}});
		comments.forEach(function (comment){
			ordered_posts.push(comment);
		});
	});
	//return array with proper order
	return ordered_posts;
};

Template.postDialog.showPostDialog = function () {
	return Session.get("showPostDialog");
};

Template.writePostDialog.events({
	'click input.add': function () {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;}
		var timestamp = new Date();
		var user = Meteor.userId();
		var course = this._id;

		if(Session.get("postID")){
			CourseDiscussions.insert({
				"parent_ID":Session.get("postID"),
				"course_ID":course,
				"time_created":timestamp,
				"user_ID":user,
				"title":$("#post_title").val(),
				"text":$("#post_text").val()
			});
			CourseDiscussions.update(
				{_id:Session.get("postID")},
				{$set:{"time_updated":timestamp}}
			);
		}else{
			CourseDiscussions.insert({
				"course_ID":course,
				"time_created":timestamp,
				"time_updated":timestamp,
				"user_ID":user,
				"title":$("#post_title").val(),
				"text":$("#post_text").val()
			});
			
			// HACK update course so time_lastchange is updated
			Meteor.call("save_course", course, {})
		}
		//reset session variables, hide dialog
		Session.set("showPostDialog", false);
		Session.set("postID", false);
	},
	//reset session variables, hide dialog
	'click input.cancel': function () {
		Session.set("showPostDialog", false);
		Session.set("postID", false);
	}
});

Template.discussion.events({
	//comment existing post
	'click input.answer': function (template) {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;}
		Session.set("postID", this._id);
		Session.set("showPostDialog", true);
	},
	//write new post
	'click input.write': function () {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;}
		Session.set("showPostDialog", true);
	}
});
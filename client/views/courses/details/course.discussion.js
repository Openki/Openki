//load template-content
Template.discussion.helpers({
	post: function() {
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
	}
});

Template.newPost.created = function() {
	this.writing = new ReactiveVar(false);
}

Template.newPost.helpers({
	writing: function() {
		return Template.instance().writing.get();
	}
});

Template.newPost.events({
	'click button.write': function () {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;
		}
		Template.instance().writing.set(true);
	},

	'click button.add': function () {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;}
		var timestamp = new Date();
		var user = Meteor.userId();
		var course = this._id;
		var parent_ID = this.parent &&  this.parent._id

		if (parent_ID) {
			CourseDiscussions.insert({
				"parent_ID":parent_ID,
				"course_ID":course,
				"time_created":timestamp,
				"time_updated":timestamp,
				"user_ID":user,
				"title":$("#post_title").val(),
				"text":$("#post_text").val()
			});
		} else {
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
		Template.instance().writing.set(false);
	},

	'click button.cancel': function () {
		Template.instance().writing.set(false);
	}
});

Template.discussion.events({
	//comment existing post
	'click button.answer': function (template) {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;}
		Session.set("postID", this._id);
		Session.set("showPostDialog", true);
	},
	//write new post
	'click button.write': function () {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;}
		Session.set("showPostDialog", true);
	}
});

Template.discussion.rendered = function() {
	this.$("[data-toggle='tooltip']").tooltip();
}
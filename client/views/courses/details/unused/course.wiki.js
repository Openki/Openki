/*

//load template-content
Template.wiki.post = function() {
	//get all first-level posts
	var posts = CourseDiscussions.find(
		{course_ID: this._id},
		{parent_ID: null},
		{sort: {time_updated: -1, time_created: -1}}
	);
	var ordered_posts = [];
	// loop over first-level post, search each post for comments, order by most recent
	posts.forEach(function (post){
		post['course_ID']  = display_coursename(post['course_ID']);
		ordered_posts.push(post);
		var comments = CourseDiscussions.find({parent_ID: post._id}, {sort: {time_created: -1}});
		comments.forEach(function (comment){
			ordered_posts.push(comment);
		});
	});
	//return array with proper order
	return ordered_posts;
};


Template.wiki.events({
	//comment existing post
	'click input.answer': function (template) {
		Session.set("postID", this._id);
		Session.set("showPostDialog", true);
	},
	//write new post
	'click input.write': function () {
		Session.set("showPostDialog", true);
	}
});

*/
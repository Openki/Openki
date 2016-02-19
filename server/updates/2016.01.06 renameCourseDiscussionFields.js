// Standardize field names in CourseDiscussions documents
UpdatesAvailable.renameDiscussionFields = function() {
	var AllPosts = CourseDiscussions.find({});
	AllPosts.fetch().forEach(function(post) {
		post.courseId = post.course_ID;
		delete post.course_ID;

		post.userId = post.user_ID;
		delete post.user_ID;

		if (post.parent_ID) {
			post.parentId = post.parent_ID;
			delete post.parent_ID;
		}

		CourseDiscussions.update(post._id, post);
	});
	return AllPosts.count();
};
import CourseDiscussions from '/imports/api/course-discussions/course-discussions';

const UpdatesAvailable = [];

// Standardize field names in CourseDiscussions documents
UpdatesAvailable.renameDiscussionFields = function () {
	const AllPosts = CourseDiscussions.find({});
	AllPosts.fetch().forEach((originalPost) => {
		const post = { ...originalPost };
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

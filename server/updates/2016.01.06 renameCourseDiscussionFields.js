import CourseDiscussions from '/imports/api/course-discussions/course-discussions';

const UpdatesAvailable = [];
// Standardize field names in CourseDiscussions documents
UpdatesAvailable.renameDiscussionFields = function () {
	const AllPosts = CourseDiscussions.find({});
	AllPosts.fetch().forEach((post) => {
		// eslint-disable-next-line no-param-reassign
		post.courseId = post.course_ID;
		// eslint-disable-next-line no-param-reassign
		delete post.course_ID;

		// eslint-disable-next-line no-param-reassign
		post.userId = post.user_ID;
		// eslint-disable-next-line no-param-reassign
		delete post.user_ID;

		if (post.parent_ID) {
			// eslint-disable-next-line no-param-reassign
			post.parentId = post.parent_ID;
			// eslint-disable-next-line no-param-reassign
			delete post.parent_ID;
		}

		CourseDiscussions.update(post._id, post);
	});
	return AllPosts.count();
};

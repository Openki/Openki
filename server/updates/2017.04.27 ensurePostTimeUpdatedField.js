UpdatesAvailable.ensurePostTimeUpdatedField = function() {
	var fetchedPosts = CourseDiscussions.find({ time_updated: null }).fetch();

	// Until now it is not possible to reference a document field while updating
	// https://stackoverflow.com/questions/3788256#3792958
	_.each(fetchedPosts, function(post) {
		CourseDiscussions.update(
			{ _id: post._id },
			{ time_updated: post.time_created }
		);
	});
};

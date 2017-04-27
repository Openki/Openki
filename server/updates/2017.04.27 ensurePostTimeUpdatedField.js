UpdatesAvailable.ensurePostTimeUpdatedField = function() {
	// Until now it is not possible to reference a document field during an
	// update. Therefore we have to fetch the results and iterate over them.
	// https://stackoverflow.com/questions/3788256#3792958
	var fetchedPosts = CourseDiscussions.find({ time_updated: null }).fetch();

	_.each(fetchedPosts, function(post) {
		CourseDiscussions.update(
			{ _id: post._id },
			{ time_updated: post.time_created }
		);
	});
};

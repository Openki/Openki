UpdatesAvailable["2017.05.08 ensurePostTimeUpdatedField"] = function() {
	var count = 0;

	// Until now it is not possible to reference a document field during an
	// update. Therefore we have to fetch the results and iterate over them.
	// https://stackoverflow.com/questions/3788256#3792958
	CourseDiscussions.find({ time_updated: null }).forEach(function(post) {
		count += 1;
		CourseDiscussions.update(
			{ _id: post._id },
			{ $set: { time_updated: post.time_created } }
		);
	});

	return count;
};

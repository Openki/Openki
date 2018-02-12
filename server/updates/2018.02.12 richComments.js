import Log from '/imports/api/log/log.js';
import CourseDiscussions from '/imports/api/course-discussions/course-discussions.js';

var updateName = '2018.02.12 richComments';

UpdatesAvailable[updateName] = function() {
	var count = 0;
    
	CourseDiscussions.find().forEach(function(comment) {
		const richText = HtmlTools.plainToHtml(comment.text);
		const saneRichText = HtmlTools.saneHtml(richText);
		var rel = [updateName, comment._id];
		Log.record('Update.Mutation', rel,
			{ comment: comment._id
			, originalText: comment.text
			, updatedText: saneRichText
			, update: updateName
			}
		);

		const update = { $set: { text: saneRichText } };
		const updated = CourseDiscussions.update(comment._id, update);
		if (updated) count++;
	});

	return count;
};

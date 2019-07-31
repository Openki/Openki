import Log from '/imports/api/log/log';
import CourseDiscussions from '/imports/api/course-discussions/course-discussions';

import HtmlTools from '/imports/utils/html-tools';

const updateName = '2018.02.12 richComments';

const UpdatesAvailable = [];

// eslint-disable-next-line func-names
UpdatesAvailable[updateName] = function () {
	let count = 0;

	CourseDiscussions.find().forEach((comment) => {
		const richText = HtmlTools.plainToHtml(comment.text);
		const saneRichText = HtmlTools.saneHtml(richText);
		const rel = [updateName, comment._id];
		Log.record('Update.Mutation', rel,
			{
				comment: comment._id,
				originalText: comment.text,
				updatedText: saneRichText,
				update: updateName,
			});

		const update = { $set: { text: saneRichText } };
		const updated = CourseDiscussions.update(comment._id, update);
		if (updated) count += 1;
	});

	return count;
};

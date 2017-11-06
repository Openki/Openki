import { Template } from 'meteor/templating';

import './course-history.html';

Template.coursehistory.helpers({
	pastEventsList: function() {
		return Events.find(
			{ courseId: this.course._id, start: { $lt: new Date() } },
			{ sort: { start: -1 } }
		);
	},
});

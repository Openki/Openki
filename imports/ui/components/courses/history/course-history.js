import { Template } from 'meteor/templating';

import Events from '/imports/api/events/events.js';

import '/imports/ui/components/profile-link/profile-link.js';

import './course-history.html';

Template.coursehistory.helpers({
	pastEventsList: function() {
		return Events.find(
			{ courseId: this.course._id, start: { $lt: new Date() } },
			{ sort: { start: -1 } }
		);
	},
});

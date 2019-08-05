import { Template } from 'meteor/templating';

import Events from '/imports/api/events/events';

import '/imports/ui/components/profile-link/profile-link';

import './course-history.html';

Template.coursehistory.helpers({
	pastEventsList() {
		return Events.find(
			{ courseId: this.course._id, start: { $lt: new Date() } },
			{ sort: { start: -1 } },
		);
	},
});

import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import Groups from '/imports/api/groups/groups';
import '/imports/ui/components/language-selection/language-selection';

import './kiosk.html';

Template.kioskEvents.helpers({
	groupShort(groupId) {
		const instance = Template.instance();
		instance.subscribe('group', groupId);

		const group = Groups.findOne({ _id: groupId });
		if (group) {
			return group.short;
		}
		return '';
	},
	showTime() {
		Session.get('seconds');
		return moment().format('LTS');
	},
	showDate() {
		Session.get('seconds');
		return moment().format('LL');
	},
});

Template.kioskEvent.helpers({
	timePeriod() {
		return Template.instance().parentInstance().data.timePeriod;
	},

	isOngoing() {
		return Template.instance().parentInstance().data.timePeriod === 'ongoing';
	},

	isUpcoming() {
		return Template.instance().parentInstance().data.timePeriod === 'upcoming';
	},
});

Template.kioskEventLocation.helpers({
	showLocation() {
		// The location is shown when we have a location name and the location is not used as a filter
		return this.location?.name
			&& !Router.current().params.query.location;
	},
});

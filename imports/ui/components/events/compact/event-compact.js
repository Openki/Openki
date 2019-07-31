import { Template } from 'meteor/templating';

import '/imports/ui/components/groups/list/group-list';
import '/imports/ui/components/venues/link/venue-link';

import './event-compact.html';

// eslint-disable-next-line func-names
Template.eventCompact.onCreated(function () {
	this.withDate = this.parentInstance().data.withDate;
});

Template.eventCompact.helpers({
	eventCompactClasses() {
		const eventCompactClasses = [];
		if (Template.instance().withDate) {
			eventCompactClasses.push('has-date');
		}
		if (moment().isAfter(this.end)) {
			eventCompactClasses.push('is-past');
		}

		return eventCompactClasses.join(' ');
	},

	withDate() {
		return Template.instance().withDate;
	},
});

Template.eventCompact.events({
	'mouseover .js-venue-link, mouseout .js-venue-link'(e, instance) {
		instance.$('.event-compact').toggleClass('elevate-child');
	},
});

// eslint-disable-next-line func-names
Template.eventCompact.rendered = function () {
	this.$('.event-compact').dotdotdot();
};

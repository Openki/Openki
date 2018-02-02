import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import Groups from '/imports/api/groups/groups.js';
import '/imports/ui/components/language-selection/language-selection.js';

import './kiosk.html';

Template.kioskEvents.helpers({
	groupShort(groupId) {
		var instance = Template.instance();
		instance.subscribe('group', groupId);

		var group = Groups.findOne({ _id: groupId });
		if (group) return group.short;
		return "";
	},
	showTime: function() {
		Session.get('seconds');
		return moment().format('LTS');
	},
	showDate: function() {
		Session.get('seconds');
		return moment().format('LL');
	}
});

Template.kioskEvent.helpers({
	timePeriod: function() {
		return Template.instance().parentInstance().data.timePeriod;
	},

	timeFromNow(date) {
		Session.get('fineTime');
		Session.get('timeLocale'); // it depends
		if (date) return moment(date).fromNow();
	},

	isOngoing: function() {
		return Template.instance().parentInstance().data.timePeriod == "ongoing";
	},

	isUpcoming: function() {
		return Template.instance().parentInstance().data.timePeriod == "upcoming";
	}
});

Template.kioskEvent.rendered = function() {
	this.$('.kiosk-event').dotdotdot();
};

Template.kioskEventLocation.helpers({
	showLocation: function() {
		// The location is shown when we have a location name and the location is not used as a filter
		return this.location
		    && this.location.name
		    && !Router.current().params.query.location;
	}
});

import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import '/imports/ui/components/loading/loading.js';

import './calendar-frame.html';

Template.frameCalendar.onCreated(function() {
	var instance = this;

	instance.groupedEvents = new ReactiveVar([]);
	instance.days = new ReactiveVar([]);

	const query = Router.current().params.query;
	this.limit = new ReactiveVar(parseInt(query.count, 10) || 200);

	instance.autorun(function() {
		var filter = Events.Filtering()
		             .read(Router.current().params.query)
		             .done();

		var filterParams = filter.toParams();
		filterParams.after = new Date();

		const limit = instance.limit.get();
		instance.subscribe('Events.findFilter', filterParams, limit + 1);

		var events =
			Events
			.find({}, { sort: { start: 1}, limit })
			.fetch();

		var groupedEvents = _.groupBy(events, function(event) {
			return moment(event.start).format('LL');
		});

		instance.groupedEvents.set(groupedEvents);
		instance.days.set(Object.keys(groupedEvents));
	});

	instance.allRegions = Session.get('region') == 'all';
});

Template.frameCalendar.helpers({
	'ready': function() {
		return Template.instance().subscriptionsReady();
	},

	'days': function() {
		return Template.instance().days.get();
	},

	'eventsOn': function(day) {
		var groupedEvents = Template.instance().groupedEvents.get();
		return groupedEvents[day];
	},

	moreEvents() {
		const limit = Template.instance().limit.get();
		const eventsCount =
			Events
			.find({}, { limit: limit + 1 })
			.count();

		return eventsCount > limit;
	}
});

Template.frameCalendar.events({
	'click .js-show-more-events'(event, instance) {
		const limit = instance.limit;
		limit.set(limit.get() + 10);
	}
});


Template.frameCalendarEvent.onCreated(function() {
	this.expanded = new ReactiveVar(false);
});


Template.frameCalendarEvent.helpers({
	'allRegions': function() {
		return Template.instance().parentInstance().allRegions;
	},

	'regionName': function() {
		return Regions.findOne(this.region).name;
	},

	'expanded': function() {
		return Template.instance().expanded.get();
	}
});

Template.frameCalendarEvent.events({
	'click .js-toggle-event-details': function(e, instance) {
		$(e.currentTarget).toggleClass('active');
		instance.$('.frame-list-item-time').toggle();
		instance.expanded.set(!instance.expanded.get());
	}
});

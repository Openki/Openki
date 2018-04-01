import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { _ } from 'meteor/underscore';

import Events from '/imports/api/events/events.js';
import Regions from '/imports/api/regions/regions.js';

import '/imports/ui/components/loading/loading.js';

import './calendar-frame.html';

Template.frameCalendar.onCreated(function frameCalendarOnCreated() {
	this.groupedEvents = new ReactiveVar([]);
	this.days = new ReactiveVar([]);

	const query = Router.current().params.query;
	this.limit = new ReactiveVar(parseInt(query.count, 10) || 200);

	this.autorun(() => {
		const filter = Events.Filtering().read(query).done();
		const filterParams = filter.toParams();
		filterParams.after = new Date();
		const limit = this.limit.get();

		this.subscribe('Events.findFilter', filterParams, limit + 1);

		const events = Events.find({}, { sort: { start: 1}, limit }).fetch();
		const groupedEvents = _.groupBy(events, (event) => {
			return moment(event.start).format('LL');
		});

		this.groupedEvents.set(groupedEvents);
		this.days.set(Object.keys(groupedEvents));
	});

	this.allRegions = Session.equals('region', 'all');
});

Template.frameCalendar.helpers({
	ready: () => Template.instance().subscriptionsReady(),

	days: () => Template.instance().days.get(),

	eventsOn: day => Template.instance().groupedEvents.get()[day],

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

Template.frameCalendarEvent.onCreated(function frameCalendarEventOnCreated() {
	this.expanded = new ReactiveVar(false);
});

Template.frameCalendarEvent.helpers({
	allRegions: () => Template.instance().parentInstance().allRegions,

	regionName() {
		return Regions.findOne(this.region).name;
	},

	expanded: () => Template.instance().expanded.get(),

	toggleIndicatorIcon() {
		return Template.instance().expanded.get() ? 'minus' : 'plus';
	}
});

Template.frameCalendarEvent.events({
	'click .js-toggle-event-details'(event, instance) {
		$(event.currentTarget).toggleClass('active');
		instance.$('.frame-list-item-time').toggle();
		instance.expanded.set(!instance.expanded.get());
	}
});

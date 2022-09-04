import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import moment from 'moment';
import { decode } from 'html-entities';

import { EventModel, Events } from '/imports/api/events/events';
import { Regions } from '/imports/api/regions/regions';

import '/imports/ui/components/loading';

import './template.html';

{
	const Template = TemplateAny as TemplateStaticTyped<
		'frameCalendarPage',
		unknown,
		{
			groupedEvents: ReactiveVar<_.Dictionary<EventModel[]>>;
			days: ReactiveVar<string[]>;
			limit: ReactiveVar<number>;
		}
	>;

	const template = Template.frameCalendarPage;

	template.onCreated(function () {
		const instance = this;

		instance.groupedEvents = new ReactiveVar({});
		instance.days = new ReactiveVar([]);

		const { query } = Router.current().params;
		instance.limit = new ReactiveVar(parseInt(query.count || '', 10) || 200);

		let startDate = moment();
		if (query.start) {
			startDate = moment(query.start);
		}
		let endDate: moment.Moment;
		if (query.end) {
			endDate = moment(query.end).add(1, 'day');
		}

		instance.autorun(() => {
			const filter = Events.Filtering().read(query);
			if (startDate && startDate.isValid()) {
				filter.add('after', startDate.toISOString());
			}
			if (endDate && endDate.isValid()) {
				filter.add('end', endDate.toISOString());
			}

			filter.done();

			const filterQuery = filter.toQuery();
			const limit = instance.limit.get();

			// Show internal events only when a group or venue is specified
			if (!filterQuery.group && !filterQuery.venue && filterQuery.internal === undefined) {
				filterQuery.internal = false;
			}

			instance.subscribe('Events.findFilter', filterQuery, limit + 1);

			const events = Events.find({}, { sort: { start: 1 }, limit }).fetch();
			const groupedEvents = _.groupBy(events, (event) => moment(event.start).format('LL'));

			instance.groupedEvents.set(groupedEvents);
			instance.days.set(Object.keys(groupedEvents));
		});
	});

	template.helpers({
		days() {
			return Template.instance().days.get();
		},

		eventsOn(day: string) {
			return Template.instance().groupedEvents.get()[day];
		},

		moreEvents() {
			const limit = Template.instance().limit.get();
			const eventsCount = Events.find({}, { limit: limit + 1 }).count();

			return eventsCount > limit;
		},
	});

	template.events({
		'click .js-show-more-events'(_event, instance) {
			const { limit } = instance;
			limit.set(limit.get() + 10);
		},
	});
}

{
	const Template = TemplateAny as TemplateStaticTyped<
		'frameCalendarEvent',
		EventModel,
		{ expanded: ReactiveVar<boolean> }
	>;

	const template = Template.frameCalendarEvent;

	template.onCreated(function () {
		this.expanded = new ReactiveVar(false);
	});

	template.helpers({
		allRegions() {
			return Session.equals('region', 'all');
		},

		regionName() {
			return Regions.findOne(this.region)?.name;
		},

		expanded: () => Template.instance().expanded.get(),

		getAttendees() {
			const { data } = Template.instance();
			return data.participants?.length || 0;
		},

		getTotalAvailableSeats() {
			const { data } = Template.instance();
			return data.maxParticipants || decode('&#8734;');
		},
	});

	template.events({
		'click .js-toggle-event-details'(event, instance) {
			$(event.currentTarget).toggleClass('active');
			instance.$('.frame-list-item-time').toggle();
			instance.expanded.set(!instance.expanded.get());
		},
	});
}

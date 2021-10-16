import { _ } from 'meteor/underscore';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import moment from 'moment';

import { EventModel, Events } from '/imports/api/events/events';

import LocalTime from '/imports/utils/local-time';
import { reactiveNow } from '/imports/utils/reactive-now';

import './template.html';
import './styles.scss';

type EventViewModel = EventModel & { repKeyDay: number; repCount: number };

const Template = TemplateAny as TemplateStaticTyped<
	'frameSchedulePage',
	unknown,
	{
		interval: ReactiveVar<number>;
		scheduleStart: ReactiveVar<moment.Moment>;
		separators: ReactiveVar<number[]>;
		repeatingOnly: ReactiveVar<boolean>;
		days: ReactiveVar<number[]>;
		intervals: ReactiveVar<number[]>;
		slots: ReactiveVar<any>;
		kindMap: (title: string) => number | false;
	}
>;

const template = Template.frameSchedulePage;

template.onCreated(function () {
	const filter = Events.Filtering();

	const instance = this;
	instance.interval = new ReactiveVar(60);
	instance.scheduleStart = new ReactiveVar(moment());
	instance.separators = new ReactiveVar([]);
	instance.repeatingOnly = new ReactiveVar(false);

	// Read query params
	this.autorun(() => {
		const query = Router.current().params.query as Record<string, string>;

		instance.repeatingOnly.set(Object.prototype.hasOwnProperty.call(query, 'repeating'));

		let scheduleStart;
		if (query.start) {
			scheduleStart = moment(query.start);
		}
		if (!scheduleStart || !scheduleStart.isValid()) {
			scheduleStart = moment(reactiveNow.get()).startOf('week');
		}
		instance.scheduleStart.set(scheduleStart);

		const rawSeps = (query.sep || '').split(',') as string[];
		const seps = [
			...new Set(
				rawSeps
					.filter((rawSep) => rawSep.length) // get rid of 0-length
					.map((rawSep) => {
						if (rawSep.length < 3) {
							return parseInt(`${rawSep}00`, 10);
						}
						return parseInt(rawSep, 10);
					}) // standardize format
					.filter((hm) => !Number.isNaN(hm)) // filter NaN's
					.map((hm) => {
						const h = Math.floor(hm / 100);
						const m = hm % 100;
						return h * 60 + m;
					}) /* convert to minutes */,
			),
		];
		instance.separators.set(seps);

		const readInterval = parseInt(query.interval, 10);
		if (!Number.isNaN(readInterval) && readInterval > 0) {
			instance.interval.set(readInterval);
		} else if (seps.length > 0) {
			instance.interval.set(24 * 60);
		} else {
			instance.interval.set(60);
		}

		filter.clear().read(query);
		filter.add('after', scheduleStart.toISOString());
		filter.add('end', moment(scheduleStart).add(4, 'week').toISOString());
		filter.done();
	});

	this.autorun(() => {
		instance.subscribe('Events.findFilter', filter.toQuery(), 500);
	});

	instance.days = new ReactiveVar([]);
	instance.intervals = new ReactiveVar([]);
	instance.slots = new ReactiveVar({});
	instance.kindMap = function () {
		return 0;
	};

	this.autorun(() => {
		const scheduleStart = moment(filter.get('after'));
		const interval = instance.interval.get();

		// Track repeating events so we know how often they occur.
		// The key to this dict is a combination of courseId, weekday and start time.
		const repetitionCount: any = {};
		const repetitionCountDay: any = {};

		// Load events but keep only the first when they repeat on the same
		// weekday at the same time.
		const dedupedEvents: EventViewModel[] = [];
		Events.findFilter(filter.toQuery()).forEach((event) => {
			const eventStart = LocalTime.fromString(event.startLocal);

			// Build key that is the same for events of the same course that
			// start on the same time.
			let repKey = `${eventStart.hour()}-${eventStart.minute()}-`;

			// If there is no courseId, we fall back to replicationId, then _id.
			if (event.courseId) {
				repKey += event.courseId;
			} else if (event.replicaOf) {
				repKey += event.replicaOf;
			} else {
				repKey += event._id;
			}

			if (repetitionCount[repKey] >= 1) {
				repetitionCount[repKey] += 1;
			} else {
				repetitionCount[repKey] = 1;
			}

			const repKeyDay = `${eventStart.day()}-${repKey}`;
			if (repetitionCountDay[repKeyDay] >= 1) {
				repetitionCountDay[repKeyDay] += 1;
			} else {
				repetitionCountDay[repKeyDay] = 1;

				// eslint-disable-next-line no-param-reassign
				event.repKey = repKey;
				// eslint-disable-next-line no-param-reassign
				event.repKeyDay = repKeyDay;
				dedupedEvents.push(event);
			}
		});

		// Because we need to find the closest separator later on we create a
		// reversed copy which is easier to search.
		const separators = instance.separators.get().slice().reverse();

		// List of intervals where events or separators are placed
		const intervals = _.reduce(
			separators,
			(rIntervals: any, separator) => {
				/* eslint-disable-next-line no-param-reassign */
				rIntervals[separator] = separator;
				return rIntervals;
			},
			{},
		);

		// List of days where events where found
		const days: _.Dictionary<number> = {};

		// Map of slots where events were found. Each slot holds a list of events.
		const slots: any = {};

		// Count occurences of first few chars in event titles
		// This helps coloring the events so they're easier to scan.
		const kinds: any = {};

		// Place found events into the slots
		dedupedEvents.forEach((originalEvent) => {
			const event = { ...originalEvent };
			const eventStart = LocalTime.fromString(event.startLocal);

			event.repCount = repetitionCountDay[event.repKeyDay];
			if (event.repCount < 2 && instance.repeatingOnly.get()) {
				// Skip
				return;
			}

			const dayStart = moment(eventStart).startOf('day');

			const day = dayStart.diff(scheduleStart, 'days') % 7;
			days[day] = day;

			const minuteDiff = eventStart.diff(dayStart, 'minutes');
			const intervalStart = Math.floor(minuteDiff / interval) * interval;
			const closestSeparator = _.find(separators, (sep) => sep <= minuteDiff);

			const mins = Math.max(intervalStart, closestSeparator || 0);
			intervals[mins] = mins;

			if (!slots[mins]) {
				slots[mins] = {};
			}
			if (!slots[mins][day]) {
				slots[mins][day] = [];
			}

			slots[mins][day].push(event);

			const kindId = event.title.substr(0, 5);
			if (!kinds[kindId]) {
				kinds[kindId] = 1;
			}
			kinds[kindId] += 1;
		});

		const numCmp = function (a: number, b: number) {
			return a - b;
		};
		instance.days.set(_.values(days).sort(numCmp));
		instance.intervals.set(_.values(intervals).sort(numCmp));

		// Build list of most used titles (first few chars)
		const mostUsedKinds = _.sortBy(_.pairs(kinds), (kv) => -kv[1]);
		const kindRank = _.object(
			_.map(mostUsedKinds.slice(0, 15), (kv, rank) => [kv[0], rank + 1]),
		) as _.Dictionary<number>;
		instance.kindMap = function (title: string) {
			const kindId = title.substr(0, 5);
			if (kindRank[kindId]) {
				return kindRank[kindId];
			}
			return false;
		};

		_.each(slots, (dayslots, min) => {
			_.each(dayslots, (slot, day) => {
				slots[min][day] = _.sortBy(slot, (event) => {
					const dayslotKindRank = (instance.kindMap(event.title) || 100) + 100;
					const countRank = 10000 - repetitionCount[event.repKey];
					// We add repetitionCount to the sort criteria so that the
					// output hopefully looks more stable through the weekdays
					// with events occurring every weekday listed first in
					// each slot
					return `${100 + event.start.getHours()}-${
						100 + event.start.getMinutes()
					}-${dayslotKindRank}-${countRank}-${event.title}`;
				});
			});
		});
		instance.slots.set(slots);
	});
});

template.helpers({
	month() {
		const instance = Template.instance();
		return moment(instance.scheduleStart.get()).format('MMMM');
	},

	days() {
		const instance = Template.instance();
		const scheduleStart = instance.scheduleStart.get();
		return _.map(instance.days.get(), (day) =>
			moment(scheduleStart).add(day, 'days').format('dddd'),
		);
	},

	intervals() {
		const instance = Template.instance();
		const slots = instance.slots.get();

		return _.map(instance.intervals.get(), (mins) => {
			const intervalStart = moment().hour(0).minute(mins);
			return {
				intervalStart,
				intervalLabel: intervalStart.format('LT'),
				slots: _.map(instance.days.get(), (day) => (slots[mins] && slots[mins][day]) || []),
			};
		});
	},

	type(this: EventViewModel) {
		return Template.instance().kindMap(this.title) || 'other';
	},

	customStartTime(this: EventViewModel, intervalStart: moment.Moment) {
		const event = this;
		const startTime = moment(LocalTime.fromString(event.startLocal));
		startTime.locale(intervalStart.locale());
		const isSame =
			startTime.hours() === intervalStart.hours() &&
			startTime.minutes() === intervalStart.minutes();
		return isSame ? false : startTime.format('LT');
	},

	single(this: EventViewModel) {
		return this.repCount < 2;
	},

	showDate(this: EventViewModel) {
		// The date is shown if an event has no repetitions...
		if (this.repCount < 2) {
			return true;
		}

		// ... or if it doesn't occur this week.
		const instance = Template.instance();
		const oneWeekAfterScheduleStart = moment(instance.scheduleStart.get()).add(1, 'week');
		return moment.utc(this.start).isAfter(oneWeekAfterScheduleStart);
	},
});

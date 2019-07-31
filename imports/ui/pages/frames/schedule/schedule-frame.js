import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';

import Events from '/imports/api/events/events';

import LocalTime from '/imports/utils/local-time';

import './schedule-frame.html';

// eslint-disable-next-line func-names
Template.frameSchedule.onCreated(function () {
	const filter = Events.Filtering();

	const instance = this;
	instance.interval = new ReactiveVar(60);
	instance.scheduleStart = new ReactiveVar(moment());
	instance.separators = new ReactiveVar([]);
	instance.repeatingOnly = new ReactiveVar(false);

	// Read query params
	this.autorun(() => {
		const { query } = Router.current().params;

		instance.repeatingOnly.set(Object.prototype.hasOwnProperty.call(query, 'repeating'));

		let scheduleStart;
		if (query.start) scheduleStart = moment(query.start);
		if (!scheduleStart || !scheduleStart.isValid()) scheduleStart = moment(minuteTime.get()).startOf('week');
		instance.scheduleStart.set(scheduleStart);


		const rawSeps = (query.sep || '').split(',');
		const seps = [];
		_.each(rawSeps, (rawSep) => {
			if (rawSep.length === 0) {
				return;
			}

			if (rawSep.length < 3) {
				// eslint-disable-next-line no-param-reassign
				rawSep += '00';
			}

			const hm = parseInt(rawSep, 10);
			if (!Number.isNaN(hm)) {
				const h = Math.floor(hm / 100);
				const m = hm % 100;
				seps.push(h * 60 + m);
			}
		});
		const separators = _.uniq(seps);
		instance.separators.set(separators);

		const readInterval = parseInt(query.interval, 10);
		if (!Number.isNaN(readInterval) && readInterval > 0) {
			instance.interval.set(readInterval);
		} else if (separators.length > 0) {
			instance.interval.set(24 * 60);
		} else {
			instance.interval.set(60);
		}


		filter.clear().read(query);
		filter.add('after', scheduleStart);
		filter.add('end', moment(scheduleStart).add(4, 'week'));
		filter.done();
	});


	this.autorun(() => {
		instance.subscribe('Events.findFilter', filter.toQuery(), 500);
	});


	instance.days = new ReactiveVar([]);
	instance.intervals = new ReactiveVar([]);
	instance.slots = new ReactiveVar({});
	// eslint-disable-next-line func-names
	instance.kindMap = function () { return 0; };

	this.autorun(() => {
		const scheduleStart = moment(filter.get('after'));
		const interval = instance.interval.get();

		// Track repeating events so we know how often they occur.
		// The key to this dict is a combination of courseId, weekday and start time.
		const repetitionCount = {};
		const repetitionCountDay = {};

		// Load events but keep only the first when they repeat on the same
		// weekday at the same time.
		const dedupedEvents = [];
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
		// eslint-disable-next-line no-shadow
		const intervals = _.reduce(separators, (intervals, separator) => {
			// eslint-disable-next-line no-param-reassign
			intervals[separator] = separator;
			return intervals;
		}, {});

		// List of days where events where found
		const days = {};

		// Map of slots where events were found. Each slot holds a list of events.
		const slots = {};

		// Count occurences of first few chars in event titles
		// This helps coloring the events so they're easier to scan.
		const kinds = {};

		// Place found events into the slots
		_.each(dedupedEvents, (event) => {
			const eventStart = LocalTime.fromString(event.startLocal);

			// eslint-disable-next-line no-param-reassign
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
			const closestSeparator = _.find(separators, sep => sep <= minuteDiff);

			const mins = Math.max(intervalStart, closestSeparator || 0);
			intervals[mins] = mins;


			if (!slots[mins]) slots[mins] = {};
			if (!slots[mins][day]) slots[mins][day] = [];

			slots[mins][day].push(event);

			const kindId = event.title.substr(0, 5);
			if (!kinds[kindId]) kinds[kindId] = 1;
			kinds[kindId] += 1;
		});

		const numCmp = function (a, b) { return a - b; };
		instance.days.set(_.values(days).sort(numCmp));
		instance.intervals.set(_.values(intervals).sort(numCmp));

		// Build list of most used titles (first few chars)
		const mostUsedKinds = _.sortBy(_.pairs(kinds), kv => -kv[1]);
		const kindRank = _.object(_.map(mostUsedKinds.slice(0, 15), (kv, rank) => [kv[0], rank + 1]));
		// eslint-disable-next-line func-names
		instance.kindMap = function (title) {
			const kindId = title.substr(0, 5);
			if (kindRank[kindId]) return kindRank[kindId];
			return false;
		};

		_.each(slots, (dayslots, min) => {
			_.each(dayslots, (slot, day) => {
				slots[min][day] = _.sortBy(slot, (event) => {
					// eslint-disable-next-line no-shadow
					const kindRank = (instance.kindMap(event.title) || 100) + 100;
					const countRank = 10000 - repetitionCount[event.repKey];
					// We add repetitionCount to the sort criteria so that the
					// output hopefully looks more stable through the weekdays
					// with events occurring every weekday listed first in
					// each slot
					return `${100 + event.start.getHours()
					}-${100 + event.start.getMinutes()
					}-${kindRank
					}-${countRank
					}-${event.title}`;
				});
			});
		});
		instance.slots.set(slots);
	});
});

Template.frameSchedule.helpers({
	month() {
		const instance = Template.instance();
		return moment(instance.scheduleStart.get()).format('MMMM');
	},

	days() {
		const instance = Template.instance();
		const scheduleStart = instance.scheduleStart.get();
		return _.map(instance.days.get(), day => moment(scheduleStart).add(day, 'days').format('dddd'));
	},

	intervals() {
		const instance = Template.instance();
		const slots = instance.slots.get();

		return _.map(instance.intervals.get(), (mins) => {
			const intervalStart = moment().hour(0).minute(mins);
			return {
				intervalStart,
				intervalLabel: intervalStart.format('LT'),
				slots: _.map(instance.days.get(), day => (slots[mins] && slots[mins][day]) || []),
			};
		});
	},

	type() {
		return Template.instance().kindMap(this.title) || 'other';
	},

	customStartTime(intervalStart) {
		const event = this;
		const startTime = moment(LocalTime.fromString(event.startLocal));
		startTime.locale(intervalStart.locale());
		const isSame = startTime.hours() === intervalStart.hours()
				&& startTime.minutes() === intervalStart.minutes();
		return isSame ? false : startTime.format('LT');
	},

	single() {
		return this.repCount < 2;
	},

	showDate() {
		// The date is shown if an event has no repetitions...
		if (this.repCount < 2) return true;

		// ... or if it doesn't occur this week.
		const instance = Template.instance();
		const oneWeekAfterScheduleStart = moment(instance.scheduleStart.get()).add(1, 'week');
		return moment.utc(this.start).isAfter(oneWeekAfterScheduleStart);
	},
});

import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import Events from '/imports/api/events/events';

import '/imports/ui/components/events/list/event-list';
import '/imports/ui/components/loading/loading';

import './week-frame.html';

Template.frameWeek.onCreated(function () {
	const instance = this;
	instance.startOfWeek = new ReactiveVar();
	instance.weekdays = new ReactiveVar([]);

	this.autorun(() => {
		minuteTime.get();
		instance.startOfWeek.set(moment().startOf('week'));
	});

	this.autorun(() => {
		const filter = Events.Filtering()
			.read(Router.current().params.query)
			.done();

		const filterParams = filter.toParams();
		const startOfWeek = instance.startOfWeek.get();
		filterParams.after = startOfWeek.toDate();
		filterParams.before = moment(startOfWeek).add(1, 'week').toDate();

		instance.subscribe('Events.findFilter', filterParams, 200);
	});

	this.autorun(() => {
		const filter = Events.Filtering()
			.read(Router.current().params.query)
			.done();

		const start = instance.startOfWeek.get();
		const end = moment(start).add(1, 'week');

		const weekdays = [];
		let current = moment(start);
		while (current.isBefore(end)) {
			const next = moment(current).add(1, 'day');
			const filterParams = filter.toParams();
			filterParams.after = current.toDate();
			filterParams.before = next.toDate();

			weekdays.push({
				date: current,
				dayEvents: Events.findFilter(filterParams, 200),
			});
			current = next;
		}
		instance.weekdays.set(weekdays);
	});
});

Template.frameWeek.helpers({
	hasDayEvents() {
		return this.dayEvents.count() > 0;
	},

	weekdays() {
		return Template.instance().weekdays.get();
	},
});

Template.frameWeek.onRendered(function () {
	const instance = this;
	this.autorun(() => {
		// rerun when subscriptions become ready
		instance.subscriptionsReady();
		// wait until subtemplates are rendered
		setTimeout(() => {
			instance.$('a').attr('target', '_blank');
		}, 0);
	});
});

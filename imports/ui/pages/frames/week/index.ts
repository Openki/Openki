import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import moment from 'moment';

import { EventEntity, EventModel, Events } from '/imports/api/events/events';

import { reactiveNow } from '/imports/utils/reactive-now';

import '/imports/ui/components/events/list';
import '/imports/ui/components/loading';

import './template.html';
import './styles.scss';

type Weekday = {
	date: moment.Moment;
	dayEvents: Mongo.Cursor<EventEntity, EventModel>;
};

const Template = TemplateAny as TemplateStaticTyped<
	'frameWeekPage',
	unknown,
	{
		startOfWeek: ReactiveVar<moment.Moment | undefined>;
		weekdays: ReactiveVar<Weekday[]>;
	}
>;

const template = Template.frameWeekPage;

template.onCreated(function () {
	const instance = this;
	instance.startOfWeek = new ReactiveVar(undefined);
	instance.weekdays = new ReactiveVar([]);

	this.autorun(() => {
		reactiveNow.get();
		instance.startOfWeek.set(moment().startOf('week'));
	});

	this.autorun(() => {
		const filter = Events.Filtering().read(Router.current().params.query).done();

		const filterParams = filter.toQuery();
		const startOfWeek = instance.startOfWeek.get();
		if (startOfWeek) {
			filterParams.after = startOfWeek.toDate();
			filterParams.before = moment(startOfWeek).add(1, 'week').toDate();
		}
		instance.subscribe('Events.findFilter', filterParams, 200);
	});

	this.autorun(() => {
		const filter = Events.Filtering().read(Router.current().params.query).done();

		const start = instance.startOfWeek.get();
		const end = moment(start).add(1, 'week');

		const weekdays = [];
		let current = moment(start);
		while (current.isBefore(end)) {
			const next = moment(current).add(1, 'day');
			const filterParams = filter.toQuery();
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

template.onRendered(function () {
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

template.helpers({
	hasDayEvents(weekday: Weekday) {
		return weekday.dayEvents.count() > 0;
	},

	weekdays() {
		return Template.instance().weekdays.get();
	},
});

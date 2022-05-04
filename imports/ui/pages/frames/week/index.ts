import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import moment from 'moment';

import { EventEntity, EventModel, Events } from '/imports/api/events/events';

import * as UrlTools from '/imports/utils/url-tools';
import { reactiveNow } from '/imports/utils/reactive-now';
import { Filtering } from '/imports/utils/filtering';
import * as Predicates from '/imports/utils/predicates';

import '/imports/ui/components/events/list';
import '/imports/ui/components/loading';
import '/imports/ui/components/calendar-nav/week';
import type { Data as CalendarNavData } from '/imports/ui/components/calendar-nav/week';

import './template.html';
import './styles.scss';

type Weekday = {
	date: moment.Moment;
	dayEvents: Mongo.Cursor<EventEntity, EventModel>;
};

const Template = TemplateAny as TemplateStaticTyped<
	'frameWeekPage',
	Record<string, string>,
	{
		startOfWeek: ReactiveVar<moment.Moment | undefined>;
		weekdays: ReactiveVar<Weekday[]>;
		filter: ReturnType<typeof Events['Filtering']>;
		update: () => void;
	}
>;

const template = Template.frameWeekPage;

template.onCreated(function () {
	const instance = this;
	instance.startOfWeek = new ReactiveVar(undefined);
	instance.weekdays = new ReactiveVar([]);

	this.autorun(() => {
		const data = Template.currentData();

		instance.filter = Events.Filtering().read(data).done();

		instance.startOfWeek.set(
			(instance.filter.get('after') || moment(reactiveNow.get())).startOf('week'),
		);

		const filterParams = instance.filter.toQuery();
		const startOfWeek = instance.startOfWeek.get();
		filterParams.after = reactiveNow.get();
		if (startOfWeek) {
			filterParams.after = startOfWeek.toDate();
			filterParams.before = moment(startOfWeek).add(1, 'week').toDate();
		}
		instance.subscribe('Events.findFilter', filterParams, 200);
	});

	this.autorun(() => {
		const data = Template.currentData();
		const filter = Events.Filtering().read(data).done();

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

	instance.update = () => {
		const filterParams = instance.filter.toParams() as Record<string, string>;
		filterParams.control = '1';
		filterParams.filterGroups = instance.data.filterGroups || '';
		delete filterParams.region; // HACK region is kept in the session (for bad reasons)
		const queryString = UrlTools.paramsToQueryString(filterParams);

		const options: { query?: string } = {};
		if (queryString.length) {
			options.query = queryString;
		}

		Router.go(Router.current().route.getName(), {}, options);
	};
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
	control() {
		return Template.instance().data.control === '1';
	},

	calendarNavAttr() {
		const instance = Template.instance();
		return {
			search: instance.filter.get('search'),
			onChangeSearch: (newValue: string) => {
				instance.filter.add('search', newValue).done();
				instance.update();
			},
			date: instance.filter.get('after') || moment(reactiveNow.get()),
			onChangeDate: (newDate) => {
				instance.filter.add('after', newDate.startOf('week').toISOString()).done();
				instance.update();
			},
			availableGroups: new Filtering({
				filterGroups: Predicates.ids,
			})
				.read(instance.data)
				.done()
				.get('filterGroups'),
			selectedGroups: instance.filter.get('groups'),
			onAddGroup: (group) => {
				instance.filter.add('groups', group).done();
				instance.update();
			},
			onRemoveGroup: (group) => {
				instance.filter.remove('groups', group).done();
				instance.update();
			},
			categories: instance.filter.get('categories'),
			onAddCategory: (category) => {
				instance.filter.add('categories', category).done();
				instance.update();
			},
			onRemoveCategory: (category) => {
				instance.filter.remove('categories', category).done();
				instance.update();
			},
		} as CalendarNavData;
	},

	hasDayEvents(weekday: Weekday) {
		return weekday.dayEvents.count() > 0;
	},

	weekdays() {
		return Template.instance().weekdays.get();
	},
});

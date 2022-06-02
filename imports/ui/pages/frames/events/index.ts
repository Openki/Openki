import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import moment from 'moment';
import { Router } from 'meteor/iron:router';

import Events from '/imports/api/events/events';

import * as UrlTools from '/imports/utils/url-tools';
import { reactiveNow } from '/imports/utils/reactive-now';
import { Filtering } from '/imports/utils/filtering';
import * as Predicates from '/imports/utils/predicates';

import '/imports/ui/components/events/list';
import '/imports/ui/components/calendar-nav/day';
import type { Data as CalendarNavData } from '/imports/ui/components/calendar-nav/day';

import './template.html';
import './styles.scss';

const DefaultLimit = 6;

const Template = TemplateAny as TemplateStaticTyped<
	'frameEventsPage',
	Record<string, string>,
	{
		date: moment.Moment;
		filter: ReturnType<typeof Events['Filtering']>;
		limit: number;
		update: () => void;
	}
>;

const template = Template.frameEventsPage;

template.onCreated(function () {
	const instance = this;

	instance.autorun(() => {
		const data = Template.currentData();

		instance.filter = Events.Filtering().read(data).done();

		const date = instance.filter.get('after') || moment(reactiveNow.get());

		instance.date = date.startOf('day');

		const filterQuery = instance.filter.toQuery();

		filterQuery.after = instance.date.toDate();

		instance.limit =
			new Filtering({
				count: Predicates.integer,
			})
				.read(data)
				.done()
				.toQuery().count || DefaultLimit;

		instance.subscribe('Events.findFilter', filterQuery, instance.limit + 1);
	});

	instance.update = () => {
		const filterParams = instance.filter.toParams() as Record<string, string>;
		filterParams.count = instance.limit.toString();
		if (instance.data.control) {
			filterParams.control = instance.data.control;
		} else {
			delete filterParams.control;
		}
		if (instance.data.hideSwitches) {
			filterParams.hideSwitches = instance.data.hideSwitches;
		} else {
			delete filterParams.hideSwitches;
		}
		if (instance.data.filterGroups) {
			filterParams.filterGroups = instance.data.filterGroups;
		} else {
			delete filterParams.filterGroups;
		}
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

	instance.autorun(() => {
		// rerun when subscriptions become ready
		instance.subscriptionsReady();
		// wait until subtemplates are rendered
		Meteor.setTimeout(() => {
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
			hideSwitches: instance.data.hideSwitches === '1',
			search: instance.filter.get('search'),
			onChangeSearch: (newValue: string) => {
				instance.filter.add('search', newValue).done();
				instance.update();
			},
			date: instance.date,
			onChangeDate: (newDate) => {
				instance.filter.add('after', newDate.startOf('day').toISOString()).done();
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

	events() {
		const instance = Template.instance();
		const filterQuery = instance.filter.toQuery();
		filterQuery.after = instance.date.toDate();
		return Events.findFilter(filterQuery, instance.limit);
	},
});

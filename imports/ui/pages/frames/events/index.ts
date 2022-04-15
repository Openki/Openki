import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import moment from 'moment';
import { Router } from 'meteor/iron:router';

import Events from '/imports/api/events/events';

import * as UrlTools from '/imports/utils/url-tools';
import { reactiveNow } from '/imports/utils/reactive-now';

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
		update: () => void;
	}
>;

const template = Template.frameEventsPage;

template.onCreated(function () {
	const instance = this;

	instance.autorun(() => {
		const data = Template.currentData();

		instance.filter = Events.Filtering().read(data).done();

		instance.date = instance.filter.get('start');

		const filterParams = this.filter.toQuery();
		filterParams.after = reactiveNow.get();

		const limit = parseInt(data.count, 10) || DefaultLimit;

		Meteor.subscribe('Events.findFilter', filterParams, limit * 2);
	});

	instance.update = () => {
		const filterParams = instance.filter.toParams() as Record<string, string>;
		filterParams.count = instance.data.count || DefaultLimit.toString();
		filterParams.control = instance.data.control || '0';
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
		instance.$('a').attr('target', '_blank');
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
			date: instance.filter.get('start') || moment(reactiveNow.get()),
			onChangeDate: (newDate) => {
				instance.filter.add('start', newDate.toISOString()).done();
				instance.update();
			},
			categories: instance.filter.get('categories'),
			onAddCategory: (categorie) => {
				instance.filter.add('categories', categorie).done();
				instance.update();
			},
			onRemoveCategory: (categorie) => {
				instance.filter.remove('categories', categorie).done();
				instance.update();
			},
		} as CalendarNavData;
	},

	events() {
		const instance = Template.instance();
		const filterParams = instance.filter.toQuery();
		filterParams.after = reactiveNow.get();

		const limit = parseInt(instance.data.count, 10) || DefaultLimit;

		return Events.findFilter(filterParams, limit);
	},
});

import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';

import { Events, FindFilter } from '/imports/api/events/events';

import { MeteorAsync } from '/imports/utils/promisify';

import '/imports/ui/components/calendar-nav/multi';
import '/imports/ui/components/events/list';
import '/imports/ui/components/loading';

import './template.html';
import './styles.scss';

{
	const Template = TemplateAny as TemplateStaticTyped<
		'calendarPage',
		unknown,
		{ filter: ReturnType<typeof Events['Filtering']>; eventSub: Meteor.SubscriptionHandle }
	>;

	const template = Template.calendarPage;

	template.onCreated(function () {
		const instance = this;

		const filter = Events.Filtering();
		instance.filter = filter;

		// Read URL state
		instance.autorun(() => {
			const { query } = Router.current().params;

			// Show internal events only when a group or venue is specified
			if (!query.group && !query.venue && query.internal === undefined) {
				query.internal = false;
			}

			filter
				.clear()
				.add('start', moment().startOf('week').toISOString())
				.read(query)
				.add('region', Session.get('region'))
				.done();
		});

		instance.autorun(() => {
			const filterQuery = filter.toQuery() as FindFilter;

			const start = filter.get('start').toDate();
			const end = filter.get('start').add(1, 'week').toDate();

			filterQuery.after = start;
			filterQuery.end = end;
			instance.eventSub = instance.subscribe('Events.findFilter', filterQuery);
		});
	});

	template.onRendered(function () {
		const instance = Template.instance();
		// change of week does not trigger onRendered again
		instance.autorun(async () => {
			// only do this in the current week
			if (moment().format('w') === instance.filter.get('start').format('w')) {
				if (instance.eventSub.ready()) {
					await MeteorAsync.defer();
					const elem = instance.$('.js-calendar-date').eq(moment().weekday());

					// calendar nav and topnav are together 103 px fixed height, we add 7px margin
					window.scrollTo(0, (elem.offset() || { top: 0 }).top - 110);
				}
			}
		});
	});

	template.helpers({
		days() {
			const start = Template.instance().filter.get('start');
			let i = 0;
			const days = [];
			for (; i < 7; i += 1) {
				days.push({
					start: moment(start).add(i, 'days'),
					end: moment(start).add(i + 1, 'days'),
				});
			}
			return days;
		},
		filter() {
			return Template.instance().filter;
		},
		startDate() {
			return moment(Template.instance().filter.get('start'));
		},
	});
}
{
	const Template = TemplateAny as TemplateStaticTyped<
		'calendarDayFormat',
		{
			day: {
				start: moment.Moment;
				end: moment.Moment;
			};
			filter: ReturnType<typeof Events['Filtering']>;
		}
	>;

	const template = Template.calendarDayFormat;

	template.helpers({
		hasEvents() {
			const data = Template.currentData();
			const filterQuery = data.filter.toQuery() as FindFilter;
			filterQuery.period = [data.day.start.toDate(), data.day.end.toDate()];

			return Events.findFilter(filterQuery, 1).count() > 0;
		},
		events() {
			const data = Template.currentData();
			const filterQuery = data.filter.toQuery() as FindFilter;
			filterQuery.period = [data.day.start.toDate(), data.day.end.toDate()];

			return Events.findFilter(filterQuery);
		},
		eventsReady() {
			const instance = Template.instance();
			return (instance.parentInstance() as any).eventSub.ready();
		},
	});
}

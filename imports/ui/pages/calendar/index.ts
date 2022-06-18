import { Session } from 'meteor/session';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
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
		Record<string, string>,
		{ filter: ReturnType<typeof Events['Filtering']> }
	>;

	const template = Template.calendarPage;

	template.onCreated(function () {
		const instance = this;

		const filter = Events.Filtering();
		instance.filter = filter;

		// Read URL state
		instance.autorun(() => {
			const data = Template.currentData();

			// Show internal events only when a group or venue is specified
			if (!data.group && !data.venue && data.internal === undefined) {
				data.internal = '0';
			}

			filter
				.clear()
				.add('start', moment().startOf('week').toISOString())
				.read(data)
				.add('region', Session.get('region'))
				.done();

			const filterQuery = filter.toQuery() as FindFilter;

			const after = filter.get('start').toDate();
			const end = filter.get('start').add(1, 'week').toDate();

			filterQuery.after = after;
			filterQuery.end = end;
			instance.subscribe('Events.findFilter', filterQuery);
		});
	});

	template.onRendered(function () {
		const instance = Template.instance();
		// change of week does not trigger onRendered again
		instance.autorun(async () => {
			// only do this in the current week
			if (moment().format('w') === instance.filter.get('start').format('w')) {
				if (instance.subscriptionsReady()) {
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
			const days = [];
			for (let i = 0; i < 7; i += 1) {
				days.push({
					start: moment(start).add(i, 'days'),
					end: moment(start).add(i + 1, 'days'),
				});
			}
			return days;
		},
		startDate() {
			return moment(Template.instance().filter.get('start'));
		},
	});
}
{
	const Template = TemplateAny as TemplateStaticTyped<
		'calendarDay',
		{
			day: {
				start: moment.Moment;
				end: moment.Moment;
			};
			filter: ReturnType<typeof Events['Filtering']>;
		}
	>;

	const template = Template.calendarDay;

	template.helpers({
		hasEvents() {
			const data = Template.instance().data;
			const filterQuery = data.filter.toQuery() as FindFilter;
			filterQuery.period = [data.day.start.toDate(), data.day.end.toDate()];

			return Events.findFilter(filterQuery, 1).count() > 0;
		},
		events() {
			const data = Template.instance().data;
			const filterQuery = data.filter.toQuery() as FindFilter;
			filterQuery.period = [data.day.start.toDate(), data.day.end.toDate()];

			return Events.findFilter(filterQuery);
		},
	});
}

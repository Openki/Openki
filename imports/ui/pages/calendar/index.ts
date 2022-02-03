import { Router } from 'meteor/iron:router';
import $ from 'jquery';
import { i18n } from '/imports/startup/both/i18next';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Spacebars } from 'meteor/spacebars';
import moment from 'moment';

import { Events, FindFilter } from '/imports/api/events/events';
import * as UrlTools from '/imports/utils/url-tools';

import '/imports/ui/components/events/list';
import '/imports/ui/components/loading';

import './template.html';
import './styles.scss';

{
	const Template = TemplateAny as TemplateStaticTyped<
		'calendar',
		unknown,
		{ filter: ReturnType<typeof Events['Filtering']>; eventSub: Meteor.SubscriptionHandle }
	>;

	const template = Template.calendar;

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
			const limit = filter.get('start').add(1, 'week').toDate();

			filterQuery.period = [start, limit];
			instance.eventSub = instance.subscribe('Events.findFilter', filterQuery);
		});
	});

	template.onRendered(function () {
		const instance = Template.instance();
		// change of week does not trigger onRendered again
		this.autorun(() => {
			// only do this in the current week
			if (moment().format('w') === instance.filter.get('start').format('w')) {
				if (instance.eventSub.ready()) {
					Meteor.defer(function () {
						const elem = instance.$('.js-calendar-date').eq(moment().weekday());

						// calendar nav and topnav are together 103 px fixed height, we add 7px margin
						window.scrollTo(0, (elem.offset() || { top: 0 }).top - 110);
					});
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
{
	const Template = TemplateAny as TemplateStaticTyped<
		'calendarNav',
		unknown,
		{ currentUnit: ReactiveVar<string> }
	>;

	const template = Template.calendarNav;

	template.helpers({
		endDateTo(date: moment.Moment) {
			return moment(date).add(6, 'days');
		},
	});

	template.onCreated(function () {
		this.currentUnit = new ReactiveVar('week');
	});

	template.onRendered(function () {
		const navContainer = this.$('.calendar-nav-container');
		navContainer.slideDown();

		$(window).on('scroll', () => {
			const isCovering = navContainer.hasClass('calendar-nav-container-covering');
			const atTop = ($(window).scrollTop() || 0) < 5;

			if (!isCovering && !atTop) {
				navContainer.addClass('calendar-nav-container-covering');
			} else if (isCovering && atTop) {
				navContainer.removeClass('calendar-nav-container-covering');
			}
		});
	});
}

{
	const updateUrl = function (instance: any) {
		const filterParams = instance.filter.toParams();
		delete filterParams.region; // HACK region is kept in the session (for bad reasons)
		const queryString = UrlTools.paramsToQueryString(filterParams);

		const options: { query?: string } = {};
		if (queryString.length) {
			options.query = queryString;
		}

		Router.go('calendar', {}, options);
	};
	const mvDateHandler = function (unit: string, instance: any) {
		const amount = instance.data.direction === 'previous' ? -1 : 1;
		const calendarInstance = instance.parentInstance(2);
		const start = calendarInstance.filter.get('start');
		const weekCorrection = unit === 'week' ? 0 : 1;

		if (amount < 0) {
			start.add(amount, unit).startOf('week');
		} else {
			start.add(amount, unit).add(weekCorrection, 'week').startOf('week');
		}
		calendarInstance.filter.add('start', start).done();
		/* eslint-disable-next-line no-restricted-globals */
		updateUrl(calendarInstance);
		return false;
	};

	const Template = TemplateAny as TemplateStaticTyped<'calendarNavControl', { direction: string }>;

	const template = Template.calendarNavControl;

	template.events({
		'click .js-change-date'(event, instance) {
			event.preventDefault();
			const unit = (instance.parentInstance() as any).currentUnit.get();
			mvDateHandler(unit, instance);
		},

		'click .js-change-unit'(this: string, event, instance) {
			event.preventDefault();

			const unit = this;
			(instance.parentInstance() as any).currentUnit.set(unit);
			mvDateHandler(unit, instance);
		},
	});

	template.helpers({
		arrow() {
			const data = Template.currentData();

			let isRTL = Session.equals('textDirectionality', 'rtl');

			if (data.direction === 'previous') {
				isRTL = !isRTL;
			}

			const direction = isRTL ? 'left' : 'right';
			return Spacebars.SafeString(
				`<span class="fa fa-arrow-${direction} fa-fw" aria-hidden="true"></span>`,
			);
		},

		calendarNavText(direction: string, unit: string, length: string) {
			return i18n(`calendar.${direction}.${unit}.${length}`);
		},

		currentUnit() {
			const parentInstance = Template.instance().parentInstance() as any;
			return parentInstance.currentUnit.get();
		},

		navUnits() {
			const navUnits = ['week', 'month', 'year'];
			return navUnits;
		},
	});
}

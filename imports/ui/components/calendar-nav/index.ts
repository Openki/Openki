import { Router } from 'meteor/iron:router';
import $ from 'jquery';
import { i18n } from '/imports/startup/both/i18next';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Spacebars } from 'meteor/spacebars';
import moment from 'moment';

import Events from '/imports/api/events/events';

import * as UrlTools from '/imports/utils/url-tools';

import './template.html';
import './styles.scss';

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
	const units = ['week', 'month', 'year'] as const;

	type Direction = 'previous' | 'next';
	type Unit = typeof units[number];

	const updateUrl = function (filter: ReturnType<typeof Events['Filtering']>) {
		const filterParams = filter.toParams();
		delete filterParams.region; // HACK region is kept in the session (for bad reasons)
		const queryString = UrlTools.paramsToQueryString(filterParams);

		const options: { query?: string } = {};
		if (queryString.length) {
			options.query = queryString;
		}

		Router.go(Router.current().route.getName(), {}, options);
	};
	const mvDateHandler = function (unit: Unit, instance: any) {
		const amount = instance.data.direction === 'previous' ? -1 : 1;
		const filter = instance.parentInstance(2).filter as ReturnType<typeof Events['Filtering']>;
		const start = filter.get('start');
		const weekCorrection = unit === 'week' ? 0 : 1;

		if (amount < 0) {
			start.add(amount, unit).startOf('week');
		} else {
			start.add(amount, unit).add(weekCorrection, 'week').startOf('week');
		}
		filter.add('start', start).done();
		updateUrl(filter);
		return false;
	};

	const Template = TemplateAny as TemplateStaticTyped<
		'calendarNavControl',
		{ direction: Direction }
	>;

	const template = Template.calendarNavControl;

	template.events({
		'click .js-change-date'(event, instance) {
			event.preventDefault();
			const unit = (instance.parentInstance() as any).currentUnit.get();
			mvDateHandler(unit, instance);
		},

		'click .js-change-unit'(this: Unit, event, instance) {
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
				`<span class="fa-solid fa-arrow-${direction} fa-fw" aria-hidden="true"></span>`,
			);
		},

		calendarNavText(direction: string, unit: string, length: string) {
			return i18n(`calendar.${direction}.${unit}.${length}`);
		},

		currentUnit() {
			const parentInstance = Template.instance().parentInstance() as any;
			return parentInstance.currentUnit.get();
		},

		units() {
			return units;
		},
	});
}

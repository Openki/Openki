import { Router } from 'meteor/iron:router';
import $ from 'jquery';
import { i18n } from '/imports/startup/both/i18next';
import { Session } from 'meteor/session';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Spacebars } from 'meteor/spacebars';

import Events from '/imports/api/events/events';

import * as UrlTools from '/imports/utils/url-tools';

import './template.html';
import '../styles.scss';

{
	const Template = TemplateAny as TemplateStaticTyped<'calendarNavDay'>;

	const template = Template.calendarNavDay;

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
	type Direction = 'previous' | 'next';

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
	const mvDateHandler = function (instance: any) {
		const amount = instance.data.direction === 'previous' ? -1 : 1;
		const filter = instance.parentInstance(2).filter as ReturnType<typeof Events['Filtering']>;
		const start = filter.get('start');

		start.add(amount, 'day');

		filter.add('start', start).done();
		updateUrl(filter);
		return false;
	};

	const Template = TemplateAny as TemplateStaticTyped<
		'calendarNavDayControl',
		{ direction: Direction }
	>;

	const template = Template.calendarNavDayControl;

	template.events({
		'click .js-change-date'(event, instance) {
			event.preventDefault();
			mvDateHandler(instance);
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

		text(direction: string, length: string) {
			return i18n(`calendar.${direction}.day.${length}`);
		},
	});
}

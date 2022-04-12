import $ from 'jquery';
import { i18n } from '/imports/startup/both/i18next';
import { Session } from 'meteor/session';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Spacebars } from 'meteor/spacebars';
import moment from 'moment';

import '/imports/ui/components/search-field';

import './template.html';
import '../styles.scss';

export type Data = {
	search: string;
	onChangeSearch: (newValue: string) => void;
	date: moment.Moment;
	onChangeDate: (newDate: moment.Moment) => void;
};

{
	const Template = TemplateAny as TemplateStaticTyped<'calendarNavDay', Data>;

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
	template.helpers({
		searchFieldAttr() {
			const data = Template.instance().data;
			return { search: data.search, onChange: data.onChangeSearch };
		},
	});
}

{
	type Direction = 'previous' | 'next';

	const Template = TemplateAny as TemplateStaticTyped<
		'calendarNavDayControl',
		{ direction: Direction }
	>;

	const template = Template.calendarNavDayControl;

	template.events({
		'click .js-change-date'(event, instance) {
			event.preventDefault();

			const parentData = instance.parentInstance()?.data as Data;

			const amount = instance.data.direction === 'previous' ? -1 : 1;

			const newDate = parentData.date.add(amount, 'day');

			parentData.onChangeDate(newDate);
		},
	});

	template.helpers({
		arrow() {
			const data = Template.instance().data;

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

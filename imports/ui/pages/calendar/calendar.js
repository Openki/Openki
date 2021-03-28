import { Router } from 'meteor/iron:router';
import { $ } from 'meteor/jquery';
import { mf } from 'meteor/msgfmt:core';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

import Events from '/imports/api/events/events';
import UrlTools from '/imports/utils/url-tools';

import '/imports/ui/components/events/list/event-list';
import '/imports/ui/components/loading/loading';

import './calendar.html';

Template.calendar.onCreated(function () {
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
			.add('start', moment().startOf('week'))
			.read(query)
			.add('region', Session.get('region'))
			.done();
	});

	instance.autorun(() => {
		const filterQuery = filter.toQuery();

		const start = filter.get('start').toDate();
		const limit = filter.get('start').add(1, 'week').toDate();

		if (moment().format('w') === moment(start).format('w')) {
			instance.scrollNeeded = true;
		}

		filterQuery.period = [start, limit];
		instance.eventSub = instance.subscribe('Events.findFilter', filterQuery);
	});
});

const updateUrl = function (event, instance) {
	const filterParams = instance.filter.toParams();
	delete filterParams.region; // HACK region is kept in the session (for bad reasons)
	const queryString = UrlTools.paramsToQueryString(filterParams);

	const options = {};
	if (queryString.length) {
		options.query = queryString;
	}

	Router.go('calendar', {}, options);
	event.preventDefault();
};

Template.calendar.onRendered(function () {
	// change of week does not trigger onRendered again
	this.autorun(() => {
		// only do this in the current week
		if (moment().format('w') === Template.instance().filter.get('start').format('w')) {
			const instance = Template.instance();
			if (instance.eventSub.ready()) {
				Meteor.defer(function () {
					const elem = this.$('.js-calendar-date').eq(moment().weekday());
					// calendar nav and topnav are together 103 px fixed height, we add 7px margin
					window.scrollTo(0, elem.offset().top - 110);
				});
			}
		}
	});
});

Template.calendar.helpers({
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
		Session.get('timeLocale');
		return moment(Template.instance().filter.get('start'));
	},
});

Template.calendarDay.helpers({
	hasEvents() {
		const filterQuery = this.filter.toQuery();
		filterQuery.period = [this.day.start.toDate(), this.day.end.toDate()];

		return Events.findFilter(filterQuery).count() > 0;
	},
	events() {
		const filterQuery = this.filter.toQuery();
		filterQuery.period = [this.day.start.toDate(), this.day.end.toDate()];

		return Events.findFilter(filterQuery);
	},
	calendarDay(day) {
		Session.get('timeLocale');
		return moment(day.toDate()).format('dddd, Do MMMM');
	},
	eventsReady() {
		const instance = Template.instance();
		return instance.parentInstance().eventSub.ready();
	},
});


Template.calendarNav.helpers({
	weekNr(date) {
		if (date) {
			Session.get('timeLocale');
			return moment(date).week();
		}
		return false;
	},

	endDateTo(date) {
		return moment(date).add(6, 'days');
	},
});

Template.calendarNav.onCreated(function () {
	this.currentUnit = new ReactiveVar('week');
});

Template.calendarNav.onRendered(function () {
	const navContainer = this.$('.calendar-nav-container');
	navContainer.slideDown();

	$(window).scroll(() => {
		const isCovering = navContainer.hasClass('calendar-nav-container-covering');
		const atTop = $(window).scrollTop() < 5;

		if (!isCovering && !atTop) {
			navContainer.addClass('calendar-nav-container-covering');
		} else if (isCovering && atTop) {
			navContainer.removeClass('calendar-nav-container-covering');
		}
	});
});

const mvDateHandler = function (unit, instance) {
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
	updateUrl(event, calendarInstance);
	return false;
};

Template.calendarNavControl.events({
	'click .js-change-date'(event, instance) {
		const unit = instance.parentInstance().currentUnit.get();
		mvDateHandler(unit, instance);
	},

	'click .js-change-unit'(event, instance) {
		const unit = this;
		instance.parentInstance().currentUnit.set(unit);
		mvDateHandler(unit, instance);
	},
});

Template.calendarNavControl.helpers({
	arrow() {
		let isRTL = Session.get('textDirectionality') === 'rtl';

		if (this.direction === 'previous') {
			isRTL = !isRTL;
		}

		const direction = isRTL ? 'left' : 'right';
		return Spacebars.SafeString(
			`<span class="fa fa-arrow-${direction} fa-fw" aria-hidden="true"></span>`,
		);
	},

	mfString(direction, unit, length) {
		return mf(`calendar.${direction}.${unit}.${length}`);
	},

	currentUnit() {
		const parentInstance = Template.instance().parentInstance();
		return parentInstance.currentUnit.get();
	},

	navUnits() {
		const navUnits = ['week', 'month', 'year'];
		return navUnits;
	},
});

Template.calendarAddEvent.onRendered(function () {
	const instance = this;
	const eventCaption = instance.$('.event-caption-add');

	function toggleCaptionClass(e) {
		const removeClass = e.type === 'mouseout';
		eventCaption.toggleClass('placeholder', removeClass);
	}

	eventCaption.on('mouseover mouseout', (e) => { toggleCaptionClass(e); });
	instance.$('.event-caption-add-text').on('mouseover mouseout', (e) => { toggleCaptionClass(e); });
});

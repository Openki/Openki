import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import { Analytics } from '/imports/ui/lib/analytics';

import Events from '/imports/api/events/events';
import { Regions } from '/imports/api/regions/regions';

import '/imports/ui/components/events/list/event-list';
import '/imports/ui/components/loading/loading';
import '../delete-events/delete-events';

import './course-events.html';

Template.courseEvents.onCreated(function () {
	const instance = this;
	const courseId = this.data.course._id;

	instance.eventSub = instance.subscribe('eventsForCourse', courseId);

	const maxEventsShown = 4;
	instance.showAllEvents = new ReactiveVar(false);
	this.showModal = new ReactiveVar(false);

	instance.haveEvents = function () {
		return Events.findFilter({ course: courseId, start: minuteTime.get() }, 1).count() > 0;
	};

	instance.haveMoreEvents = function () {
		return Events.findFilter(
			{ course: courseId, start: minuteTime.get() },
		).count() > maxEventsShown;
	};

	instance.ongoingEvents = function () {
		return Events.findFilter({ course: courseId, ongoing: minuteTime.get() });
	};

	instance.futureEvents = function () {
		const limit = instance.showAllEvents.get() ? 0 : maxEventsShown;

		return Events.findFilter({ course: courseId, after: minuteTime.get() }, limit);
	};
});

Template.courseEvents.helpers({
	mayAdd() {
		return this.course.editableBy(Meteor.user());
	},

	haveEvents() {
		return Template.instance().haveEvents();
	},

	ongoingEvents() {
		return Template.instance().ongoingEvents();
	},

	haveOngoingEvents() {
		return Template.instance().ongoingEvents().count() > 0;
	},

	futureEvents() {
		return Template.instance().futureEvents();
	},

	haveFutureEvents() {
		return Template.instance().futureEvents().count() > 0;
	},

	haveMoreEvents() {
		const instance = Template.instance();
		return instance.haveMoreEvents() && !instance.showAllEvents.get();
	},

	ready() {
		return Template.instance().eventSub.ready();
	},

	showModal() {
		return Template.instance().showModal.get();
	},

	upcomingEvents() {
		return Events.findFilter(
			{
				course: this.course._id,
				after: minuteTime.get(),
			},
		);
	},
});

Template.courseEvents.events({
	'click .js-show-all-events'() {
		Template.instance().showAllEvents.set(true);
	},

	'scroll .js-scrollable-container'(event, instance) {
		const scrollableContainer = instance.$('.js-scrollable-container');

		// Use dom element to get true height of clipped div
		// https://stackoverflow.com/questions/4612992/get-full-height-of-a-clipped-div#5627286
		const trueHeight = scrollableContainer[0].scrollHeight;
		const visibleHeight = scrollableContainer.height();

		// Compute height and subtract a possible deviation
		const computedHeight = trueHeight - visibleHeight - 1;

		instance.$('.fade-top ').fadeIn(200);

		if (scrollableContainer.scrollTop() === 0) {
			instance.$('.fade-top').fadeOut(200);
		} else if (scrollableContainer.scrollTop() >= computedHeight) {
			instance.$('.fade-bottom').fadeOut(200);
		} else {
			instance.$('.fade-top').fadeIn(200);
			instance.$('.fade-bottom').fadeIn(200);
		}
	},

	'click .js-track-cal-download'(event, instance) {
		Analytics.trackEvent('Events downloads', 'Events downloads via course details', Regions.findOne(instance.data.course.region)?.nameEn);
	},
});

Template.courseEventAdd.helpers({
	addEventQuery() {
		return `courseId=${this.course._id}`;
	},
});

Template.courseEventAdd.events({
	'mouseover/mouseout .event-caption-action'(event, instance) {
		instance.$(event.currentTarget).toggleClass('placeholder', event.type === 'mouseout');
	},
});

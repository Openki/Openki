import { Meteor } from 'meteor/meteor';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import { Analytics } from '/imports/ui/lib/analytics';

import { EventEntity, EventModel, Events } from '/imports/api/events/events';
import { Regions } from '/imports/api/regions/regions';
import { CourseModel } from '/imports/api/courses/courses';

import { reactiveNow } from '/imports/utils/reactive-now';

import '/imports/ui/components/events/list';
import '/imports/ui/components/loading';
import '/imports/ui/components/courses/delete-events';

import './template.html';
import './styles.scss';

{
	const Template = TemplateAny as TemplateStaticTyped<
		'courseEvents',
		{ course: CourseModel },
		{
			eventSub: Meteor.SubscriptionHandle;
			state: ReactiveDict<{ showAllEvents: boolean; showModal: boolean }>;
			deleteCourseEventsArgs: { onShowEventsDeleteModal: () => void };
			deleteEventsModalArgs: { onShowEventsDeleteModal: () => void };
			haveEvents: () => boolean;
			haveMoreEvents: () => boolean;
			ongoingEvents: () => Mongo.Cursor<EventEntity, EventModel>;
			futureEvents: () => Mongo.Cursor<EventEntity, EventModel>;
		}
	>;

	const template = Template.courseEvents;

	template.onCreated(function () {
		const instance = this;
		const courseId = this.data.course._id;

		instance.eventSub = instance.subscribe('eventsForCourse', courseId);

		const maxEventsShown = 4;
		instance.state = new ReactiveDict();
		instance.state.setDefault({ showAllEvents: false, showModal: false });

		instance.haveEvents = function () {
			return Events.findFilter({ course: courseId, start: reactiveNow.get() }, 1).count() > 0;
		};

		instance.haveMoreEvents = function () {
			return (
				Events.findFilter({ course: courseId, start: reactiveNow.get() }).count() > maxEventsShown
			);
		};

		instance.ongoingEvents = function () {
			return Events.findFilter({ course: courseId, ongoing: reactiveNow.get() });
		};

		instance.futureEvents = function () {
			const limit = instance.state.get('showAllEvents') ? 0 : maxEventsShown;

			return Events.findFilter({ course: courseId, after: reactiveNow.get() }, limit);
		};
	});

	template.helpers({
		mayAdd() {
			const { data } = Template.instance();
			return data.course.editableBy(Meteor.user());
		},

		haveOngoingEvents() {
			return Template.instance().ongoingEvents().count() > 0;
		},

		haveFutureEvents() {
			return Template.instance().futureEvents().count() > 0;
		},

		haveMoreEvents() {
			const instance = Template.instance();
			return instance.haveMoreEvents() && !instance.state.get('showAllEvents');
		},

		ready() {
			return Template.instance().eventSub.ready();
		},

		deleteCourseEventsArgs() {
			const instance = Template.instance();
			return {
				onShowEventsDeleteModal: () => {
					instance.state.set('showModal', true);
				},
			};
		},

		deleteEventsModalArgs() {
			const instance = Template.instance();
			const { data } = instance;
			const upcomingEvents = Events.findFilter({
				course: data.course._id,
				after: reactiveNow.get(),
			});
			return {
				upcomingEvents,
				onHideEventsDeleteModal() {
					instance.state.set('showModal', false);
				},
			};
		},
	});

	template.events({
		'click .js-show-all-events'(_event, instance) {
			instance.state.set('showAllEvents', true);
		},

		'scroll .js-scrollable-container'(_event, instance) {
			const scrollableContainer = instance.$('.js-scrollable-container');

			// Use dom element to get true height of clipped div
			// https://stackoverflow.com/questions/4612992/get-full-height-of-a-clipped-div#5627286
			const trueHeight = scrollableContainer[0].scrollHeight;
			const visibleHeight = scrollableContainer.height() || 0;
			const scrollTop = scrollableContainer.scrollTop() || 0;

			// Compute height and subtract a possible deviation
			const computedHeight = trueHeight - visibleHeight - 1;

			instance.$('.fade-top ').fadeIn(200);

			if (scrollTop === 0) {
				instance.$('.fade-top').fadeOut(200);
			} else if (scrollTop >= computedHeight) {
				instance.$('.fade-bottom').fadeOut(200);
			} else {
				instance.$('.fade-top').fadeIn(200);
				instance.$('.fade-bottom').fadeIn(200);
			}
		},

		'click .js-track-cal-download'(_event, instance) {
			Analytics.trackEvent(
				'Events downloads',
				'Events downloads via course details',
				Regions.findOne(instance.data.course.region)?.nameEn,
			);
		},
	});
}

{
	const Template = TemplateAny as TemplateStaticTyped<'courseEventAdd', { course: CourseModel }>;

	const template = Template.courseEventAdd;

	template.events({
		'mouseover/mouseout .event-caption-action'(event, instance) {
			instance.$(event.currentTarget as any).toggleClass('placeholder', event.type === 'mouseout');
		},
	});
}

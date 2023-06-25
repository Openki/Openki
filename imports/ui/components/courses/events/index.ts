import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import * as Analytics from '/imports/ui/lib/analytics';

import { EventEntity, EventModel, Events } from '/imports/api/events/events';
import { Regions } from '/imports/api/regions/regions';
import { CourseModel } from '/imports/api/courses/courses';

import { reactiveNow } from '/imports/utils/reactive-now';
import { ScssVars } from '/imports/ui/lib/scss-vars';
import * as Viewport from '/imports/ui/lib/viewport';

import '/imports/ui/components/events/list';
import '/imports/ui/components/courses/delete-events';

import './template.html';
import './styles.scss';

{
	const Template = TemplateAny as TemplateStaticTyped<
		'courseEvents',
		{ course: CourseModel },
		{
			state: ReactiveDict<{ maxEventsShown: number; showAllEvents: boolean; showModal: boolean }>;
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

		instance.subscribe('eventsForCourse', courseId);

		instance.state = new ReactiveDict();
		instance.state.setDefault({
			maxEventsShown: 2,
			showAllEvents: false,
			showModal: false,
		});

		instance.autorun(() => {
			const isMobileScreen = Viewport.get().width <= ScssVars.screenXS;
			const maxEventsShown = isMobileScreen ? 2 : 4;
			instance.state.set('maxEventsShown', maxEventsShown);
		});

		instance.haveEvents = function () {
			return Events.findFilter({ course: courseId, start: reactiveNow.get() }, 1).count() > 0;
		};

		instance.haveMoreEvents = function () {
			return (
				Events.findFilter({ course: courseId, start: reactiveNow.get() }).count() >
				(instance.state.get('maxEventsShown') || 2)
			);
		};

		instance.ongoingEvents = function () {
			return Events.findFilter({ course: courseId, ongoing: reactiveNow.get() });
		};

		instance.futureEvents = function () {
			// eslint-disable-next-line no-nested-ternary
			const limit = instance.state.get('showAllEvents')
				? 0
				: instance.state.get('maxEventsShown') || 2;

			return Events.findFilter({ course: courseId, after: reactiveNow.get() }, limit);
		};
	});

	template.helpers({
		upcomingEventsCount() {
			const course = Template.instance().data;
			return course.course.futureEvents;
		},
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
			instance
				.$(event.currentTarget as any)
				.toggleClass('event-caption-placeholder', event.type === 'mouseout');
		},
	});
}

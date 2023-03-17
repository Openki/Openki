import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Router } from 'meteor/iron:router';
import { i18n } from '/imports/startup/both/i18next';
import { _ } from 'meteor/underscore';
import { Meteor } from 'meteor/meteor';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import moment from 'moment';

import * as Alert from '/imports/api/alerts/alert';
import { Courses } from '/imports/api/courses/courses';
import { EventModel, Events } from '/imports/api/events/events';
import * as EventsMethods from '/imports/api/events/methods';
import { Regions } from '/imports/api/regions/regions';

import { PleaseLogin } from '/imports/ui/lib/please-login';

import * as Metatags from '/imports/utils/metatags';
import { appendAsJsonLdToBody } from '/imports/utils/event-to-json-ld';

import * as Analytics from '/imports/ui/lib/analytics';

import '/imports/ui/components/buttons';
import '/imports/ui/components/courses/categories';
import '/imports/ui/components/events/display/course-header';
import '/imports/ui/components/events/display/header';
import '/imports/ui/components/events/display/body';
import '/imports/ui/components/events/edit';
import '/imports/ui/components/events/participants';
import '/imports/ui/components/events/replication';
import '/imports/ui/components/groups/tag';
import '/imports/ui/components/price-policy';
import '/imports/ui/components/regions/tag';
import '/imports/ui/components/sharing';
import '/imports/ui/components/report';
import '/imports/ui/components/venues/link';
import '/imports/ui/components/internal-indicator';
import '/imports/ui/components/delete-confirm-dialog';

import './template.html';
import './styles.scss';

{
	const Template = TemplateAny as TemplateStaticTyped<'eventPage'>;

	const template = Template.eventPage;

	template.onCreated(function () {
		const instance = this;
		instance.autorun(() => {
			const event = Events.findOne(Router.current().params._id);
			let title;
			let description = '';
			if (event) {
				title = i18n('event.windowtitle', '{DATE} — {EVENT}', {
					EVENT: event.title,
					DATE: moment(event.start).calendar(),
				});
				description = i18n('event.metatag.description', '{VENUE} in {REGION}', {
					REGION: Regions.findOne(event.region)?.name,
					VENUE: event.venue?.name,
				});
				appendAsJsonLdToBody(event);
			} else {
				title = i18n('event.windowtitle.create', 'Create event');
			}
			Metatags.setCommonTags(title, description);
		});
	});
}

{
	const Template = TemplateAny as TemplateStaticTyped<
		'event',
		EventModel,
		{
			editing: ReactiveVar<boolean>;
			addParticipant: () => void;
			getCourseTitleIfAny: () => string | undefined;
			state: ReactiveDict<{ registerDropdown: boolean; unregisterDropdown: boolean }>;
		}
	>;

	const template = Template.event;

	template.onCreated(function () {
		const instance = this;
		const event = instance.data;
		instance.busy(false);
		instance.editing = new ReactiveVar(!event._id);
		instance.state = new ReactiveDict();
		instance.state.setDefault({ registerDropdown: false, unregisterDropdown: false });
		if (event.courseId) {
			instance.subscribe('courseDetails', event.courseId);
		}

		instance.addParticipant = () => {
			instance.busy('registering');
			PleaseLogin(instance, async () => {
				try {
					await EventsMethods.addParticipant(event._id);

					Analytics.trackEvent(
						'RSVPs',
						'RSVPs as participant',
						Regions.findOne(event.region)?.nameEn,
					);
				} catch (err) {
					Alert.serverError(err);
				} finally {
					this.busy(false);
				}
			});
		};

		instance.getCourseTitleIfAny = () => {
			if (this.data.courseId) {
				return Courses.findOne({ _id: this.data.courseId })?.name;
			}
			return undefined;
		};

		// register from email
		if (Router.current().params.query.action === 'register') {
			this.addParticipant();
		}
	});

	template.helpers({
		userName() {
			return (
				Meteor.user()?.getDisplayName() || i18n('eventDetails.notLoggedIn', '(not logged in?)')
			);
		},

		courseLink() {
			const event = Template.instance().data;
			if (!event.courseId) {
				return '';
			}
			const course = Courses.findOne({ _id: event.courseId });
			return Router.path(
				'showCourse',
				{ _id: event.courseId },
				course?.singleEvent ? { query: { force: '1' } } : {},
			);
		},

		courseTitle() {
			return Template.instance().getCourseTitleIfAny();
		},

		acceptsParticipants(this: EventModel) {
			// no maxParticipants
			if (!this.maxParticipants) {
				return true;
			}

			if (!this.participants) {
				return true;
			}

			if (this.participants.length < this.maxParticipants) {
				return true;
			}
			return false;
		},

		course() {
			if (this.courseId) {
				return Courses.findOne(this.courseId);
			}
			return false;
		},

		editing() {
			return this.new || Template.instance().editing.get();
		},

		isFuture(this: EventModel) {
			return moment().isBefore(this.end);
		},

		userRegisteredForEvent(this: EventModel) {
			const userId = Meteor.userId();
			return userId && this.participants?.includes(userId);
		},
		registerDropdown() {
			return Template.instance().state.get('registerDropdown');
		},
		unregisterDropdown() {
			return Template.instance().state.get('unregisterDropdown');
		},
		anyDropdown() {
			return (
				Template.instance().state.get('unregisterDropdown') ||
				Template.instance().state.get('registerDropdown')
			);
		},
	});

	template.events({
		'click .js-event-edit'(_event, instance) {
			instance.editing.set(true);
		},

		'click .js-before-register-event'(_event, instance) {
			instance.state.set('registerDropdown', true);
		},

		'click .js-register-event'(_event, instance) {
			instance.addParticipant();
			instance.state.set('registerDropdown', false);
		},

		'click .js-register-event-cancel'(_event, instance) {
			instance.state.set('registerDropdown', false);
		},

		'click .js-before-unregister-event'(_event, instance) {
			instance.state.set('unregisterDropdown', true);
		},

		async 'click .js-unregister-event'(_event, instance) {
			instance.busy('unregistering');

			try {
				await EventsMethods.removeParticipant(instance.data._id);

				Analytics.trackEvent(
					'Unsubscribes RSVPs',
					'Unsubscribes RSVPs as participant',
					Regions.findOne(instance.data.region)?.nameEn,
				);
			} catch (err) {
				Alert.serverError(err, 'could not remove participant');
			} finally {
				instance.busy(false);
			}
			instance.state.set('unregisterDropdown', false);
		},

		'click .js-unregister-event-cancel'(_event, instance) {
			instance.state.set('unregisterDropdown', false);
		},
	});
}

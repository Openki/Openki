import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { i18n } from '/imports/startup/both/i18next';
import { _ } from 'meteor/underscore';
import { Meteor } from 'meteor/meteor';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import moment from 'moment';

import * as Alert from '/imports/api/alerts/alert';
import { Courses } from '/imports/api/courses/courses';
import { EventModel, Events, EventVenueEntity } from '/imports/api/events/events';
import * as EventsMethods from '/imports/api/events/methods';
import { Groups } from '/imports/api/groups/groups';
import { Regions } from '/imports/api/regions/regions';

import { GroupNameHelpers } from '/imports/ui/lib/group-name-helpers';
import { LocationTracker } from '/imports/ui/lib/location-tracker';
import { PleaseLogin } from '/imports/ui/lib/please-login';
import { SaveAfterLogin } from '/imports/ui/lib/save-after-login';
import * as TemplateMixins from '/imports/ui/lib/template-mixins';

import * as IdTools from '/imports/utils/id-tools';
import * as Metatags from '/imports/utils/metatags';
import { appendAsJsonLdToBody } from '/imports/utils/event-to-json-ld';

import { Analytics } from '/imports/ui/lib/analytics';

import '/imports/ui/components/buttons';
import '/imports/ui/components/courses/categories';
import '/imports/ui/components/events/edit';
import '/imports/ui/components/events/participants/event-participants';
import '/imports/ui/components/events/replication/event-replication';
import '/imports/ui/components/groups/list';
import '/imports/ui/components/price-policy';
import '/imports/ui/components/regions/tag';
import '/imports/ui/components/sharing';
import '/imports/ui/components/report';
import '/imports/ui/components/venues/link/venue-link';

import './template.html';
import './styles.scss';

{
	const Template = TemplateAny as TemplateStaticTyped<'eventPage'>;

	const template = Template.eventPage;

	template.onCreated(() => {
		const event = Events.findOne(Router.current().params._id);
		let title;
		let description = '';
		if (event) {
			title = i18n('event.windowtitle', '{DATE} - {EVENT}', {
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
}

{
	const Template = TemplateAny as TemplateStaticTyped<
		'event',
		EventModel,
		{ editing: ReactiveVar<boolean>; addParticipant: () => void }
	>;

	const template = Template.event;

	template.onCreated(function () {
		const event = this.data;
		this.busy(false);
		this.editing = new ReactiveVar(!event._id);
		this.subscribe('courseDetails', event.courseId);

		this.addParticipant = () => {
			SaveAfterLogin(
				this,
				i18n('loginAction.enrollEvent', 'Login and enroll for event'),
				i18n('registerAction.enrollEvent', 'Login and enroll for event'),
				async () => {
					this.busy('registering');
					try {
						await EventsMethods.addParticipant(event._id);

						Analytics.trackEvent(
							'RSVPs',
							'RSVPs as participant',
							Regions.findOne(event.region)?.nameEn,
						);
					} catch (err) {
						Alert.serverError(err, '');
					} finally {
						this.busy(false);
					}
				},
			);
		};

		// register from email
		if (Router.current().params.query.action === 'register') {
			this.addParticipant();
		}
	});

	template.helpers({
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
	});

	template.events({
		'mouseover .event-course-header, mouseout .event-course-header'(event, instance) {
			instance.$(event.currentTarget as any).toggleClass('highlight', event.type === 'mouseover');
		},

		'click .event-course-header'() {
			Router.go('showCourse', { _id: this.courseId });
		},

		async 'click .js-event-delete-confirm'(_event, instance) {
			const oEvent = instance.data;
			const { title, region } = oEvent;
			const course = oEvent.courseId;
			instance.busy('deleting');

			Template.instance().editing.set(false);
			try {
				await EventsMethods.remove(oEvent._id);

				Alert.success(
					i18n('eventDetails.eventRemoved', 'The event "{TITLE}" has been deleted.', {
						TITLE: title,
					}),
				);

				Analytics.trackEvent(
					'Event deletions',
					'Event deletions as team',
					Regions.findOne(region)?.nameEn,
				);

				if (course) {
					Router.go('showCourse', { _id: course });
				} else {
					Router.go('/');
				}
			} catch (err) {
				Alert.serverError(err, 'Could not remove event');
			} finally {
				instance.busy(false);
			}
		},

		'click .js-event-edit'(_event, instance) {
			if (PleaseLogin()) {
				return;
			}
			instance.editing.set(true);
		},

		'click .js-register-event'(_event, instance) {
			instance.addParticipant();
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
		},
	});
}

{
	const Template = TemplateMixins.Expandible(
		TemplateAny as TemplateStaticTyped<
			'eventDisplay',
			{ region: string; venue?: EventVenueEntity },
			{ locationTracker: LocationTracker; replicating: ReactiveVar<boolean> }
		>,
		'eventDisplay',
	);

	const template = Template.eventDisplay;

	template.onCreated(function () {
		const instance = this;
		instance.locationTracker = new LocationTracker();
		instance.replicating = new ReactiveVar(false);
	});

	template.onRendered(function () {
		const instance = this;
		instance.locationTracker.setRegion(instance.data.region);
		instance.locationTracker.setLocation(instance.data.venue);
	});

	template.helpers({
		mayEdit() {
			return this.editableBy(Meteor.user());
		},
		eventMarkers() {
			return Template.instance().locationTracker.markers;
		},
		hasVenue(this: EventModel) {
			return this.venue?.loc;
		},
		replicating() {
			return Template.instance().replicating.get();
		},
	});

	template.events({
		'click .js-show-replication'(_event, instance) {
			instance.replicating.set(true);
			instance.collapse();
		},

		'click .js-track-cal-download'(_event, instance) {
			Analytics.trackEvent(
				'Events downloads',
				'Event downloads via event details',
				Regions.findOne(instance.data.region)?.nameEn,
			);
		},
	});
}

{
	const Template = TemplateAny as TemplateStaticTyped<'eventGroupList', EventModel>;

	const template = Template.eventGroupList;

	template.helpers({
		isOrganizer(this: EventModel) {
			return Template.instance().data.editors.includes(IdTools.extract(this));
		},
		tools() {
			const tools = [];
			const user = Meteor.user();
			if (user) {
				const groupId = String(this);
				const event = Template.parentData();

				// Groups may be adopted from the course, these cannot be removed
				const ownGroup = event.groups.includes(groupId);

				if (ownGroup && (user.mayPromoteWith(groupId) || event.editableBy(user))) {
					tools.push({
						toolTemplate: TemplateAny.eventGroupRemove,
						groupId,
						event,
					});
				}
				if (ownGroup && event.editableBy(user)) {
					const hasOrgRights = event.groupOrganizers.includes(groupId);
					tools.push({
						toolTemplate: hasOrgRights
							? TemplateAny.eventGroupRemoveOrganizer
							: TemplateAny.eventGroupMakeOrganizer,
						groupId,
						event,
					});
				}
			}
			return tools;
		},
	});
}
{
	const Template = TemplateMixins.Expandible(
		TemplateAny as TemplateStaticTyped<'eventGroupAdd', EventModel>,
		'eventGroupAdd',
	);

	const template = Template.eventGroupAdd;

	template.helpers({
		...GroupNameHelpers,
		groupsToAdd(this: EventModel) {
			const user = Meteor.user();
			return user && _.difference(user.groups, this.allGroups);
		},
	});

	template.events({
		async 'click .js-add-group'(e, instance) {
			const event = instance.data;
			const groupId = (e.currentTarget as HTMLButtonElement).value;

			try {
				await EventsMethods.promote(event._id, groupId, true);

				const groupName = Groups.findOne(groupId)?.name;
				Alert.success(
					i18n(
						'eventGroupAdd.groupAdded',
						'The group "{GROUP}" has been added to promote the event "{EVENT}".',
						{ GROUP: groupName, EVENT: event.title },
					),
				);
				instance.collapse();
			} catch (err) {
				Alert.serverError(err, 'Failed to add group');
			}
		},
	});
}

{
	const Template = TemplateMixins.Expandible(
		TemplateAny as TemplateStaticTyped<'eventGroupRemove', { event: EventModel; groupId: string }>,
		'eventGroupRemove',
	);

	const template = Template.eventGroupRemove;

	template.helpers(GroupNameHelpers);
	template.events({
		async 'click .js-remove'(_e, instance) {
			const { event } = instance.data;
			const { groupId } = instance.data;

			try {
				await EventsMethods.promote(event._id, groupId, false);

				const groupName = Groups.findOne(groupId)?.name;
				Alert.success(
					i18n(
						'eventGroupAdd.groupRemoved',
						'The group "{GROUP}" has been removed from the event "{EVENT}".',
						{ GROUP: groupName, EVENT: event.title },
					),
				);
				instance.collapse();
			} catch (err) {
				Alert.serverError(err, 'Failed to remove group');
			}
		},
	});
}

{
	const Template = TemplateMixins.Expandible(
		TemplateAny as TemplateStaticTyped<
			'eventGroupMakeOrganizer',
			{ event: EventModel; groupId: string }
		>,
		'eventGroupMakeOrganizer',
	);

	const template = Template.eventGroupMakeOrganizer;

	template.helpers(GroupNameHelpers);
	template.events({
		async 'click .js-makeOrganizer'(_e, instance) {
			const { event } = instance.data;
			const { groupId } = instance.data;

			try {
				await EventsMethods.editing(event._id, groupId, true);

				const groupName = Groups.findOne(groupId)?.name;
				Alert.success(
					i18n(
						'eventGroupAdd.membersCanEditEvent',
						'Members of the group "{GROUP}" can now edit the event "{EVENT}".',
						{ GROUP: groupName, EVENT: event.title },
					),
				);
				instance.collapse();
			} catch (err) {
				Alert.serverError(err, 'Failed to give group editing rights');
			}
		},
	});
}

{
	const Template = TemplateMixins.Expandible(
		TemplateAny as TemplateStaticTyped<
			'eventGroupRemoveOrganizer',
			{ event: EventModel; groupId: string }
		>,
		'eventGroupRemoveOrganizer',
	);

	const template = Template.eventGroupRemoveOrganizer;

	template.helpers(GroupNameHelpers);
	template.events({
		async 'click .js-removeOrganizer'(_e, instance) {
			const { event } = instance.data;
			const { groupId } = instance.data;

			try {
				await EventsMethods.editing(event._id, groupId, false);

				const groupName = Groups.findOne(groupId)?.name;
				Alert.success(
					i18n(
						'eventGroupAdd.membersCanNoLongerEditEvent',
						'Members of the group "{GROUP}" can no longer edit the event "{EVENT}".',
						{ GROUP: groupName, EVENT: event.title },
					),
				);
				instance.collapse();
			} catch (err) {
				Alert.serverError(err, 'Failed to remove organizer status');
			}
		},
	});
}

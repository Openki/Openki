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
import { Groups } from '/imports/api/groups/groups';
import { Regions } from '/imports/api/regions/regions';

import { GroupNameHelpers } from '/imports/ui/lib/group-name-helpers';
import { LocationTracker } from '/imports/ui/lib/location-tracker';
import * as TemplateMixins from '/imports/ui/lib/template-mixins';
import { PleaseLogin } from '/imports/ui/lib/please-login';

import * as Metatags from '/imports/utils/metatags';
import { appendAsJsonLdToBody } from '/imports/utils/event-to-json-ld';
import { getLocalizedValue } from '/imports/utils/getLocalizedValue';

import * as Analytics from '/imports/ui/lib/analytics';

import '/imports/ui/components/buttons';
import '/imports/ui/components/courses/categories';
import '/imports/ui/components/events/display/course-header';
import '/imports/ui/components/events/display/header';
import '/imports/ui/components/events/edit';
import '/imports/ui/components/events/participants';
import '/imports/ui/components/events/replication';
import '/imports/ui/components/groups/list';
import '/imports/ui/components/price-policy';
import '/imports/ui/components/regions/tag';
import '/imports/ui/components/sharing';
import '/imports/ui/components/report';
import '/imports/ui/components/venues/link';
import '/imports/ui/components/internal-indicator';
import '/imports/ui/components/delete-confirm-dialog';
import type { Props as DeleteConfirmDialogProps } from '/imports/ui/components/delete-confirm-dialog';

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
		instance.subscribe('courseDetails', event.courseId);

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

{
	const Template = TemplateMixins.Expandible(
		TemplateAny as TemplateStaticTyped<
			'eventDisplay',
			EventModel,
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
		customFields() {
			if (!this.courseId) {
				return [];
			}
			const course = Courses.findOne(this.courseId);

			if (!course) {
				return [];
			}

			const user = Meteor.user();

			const isEditor = user && course.editableBy(user);

			return (
				course.customFields
					?.filter((i) => i.visibleFor === 'all' || (i.visibleFor === 'editors' && isEditor))
					.map((i) => ({
						displayText: getLocalizedValue(i.displayText),
						value: i.value,
					})) || []
			);
		},
		deleteConfirmDialogAttr(): DeleteConfirmDialogProps {
			const instance = Template.instance();
			return {
				confirmText: i18n(
					'event.reallydelete',
					'Please confirm that you would like to delete this event. This might confuse other users and cannot be undone.',
				),
				confirmButton: i18n('event.delete.confirm.button', 'Delete this event'),
				busyButton: i18n('event.delete.confirm.button.busy', 'Deleting event…'),
				onRemove: async () => {
					const oEvent = instance.data;
					const { title, region } = oEvent;
					const course = oEvent.courseId;

					(instance.parentInstance() as any).editing.set(false);
					try {
						await EventsMethods.remove(oEvent._id);

						Alert.success(
							i18n('eventDetails.eventRemoved', 'The "{TITLE}" event has been deleted.', {
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
						Alert.serverError(
							err,
							i18n('eventDetails.eventRemoved.error', 'Could not remove event'),
						);
					}
				},
				onCancel: async () => {
					Session.set('verify', false);
				},
			};
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
			const { editors } = Template.instance().data;
			return editors?.includes(this._id);
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
						'The group "{GROUP}" has been added to promote the "{EVENT}" event.',
						{ GROUP: groupName, EVENT: event.title },
					),
				);
				instance.collapse();
			} catch (err) {
				Alert.serverError(err, i18n('eventGroupAdd.groupAdded.error', 'Failed to add group'));
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
						'The group "{GROUP}" has been removed from the "{EVENT}" event.',
						{ GROUP: groupName, EVENT: event.title },
					),
				);
				instance.collapse();
			} catch (err) {
				Alert.serverError(err, i18n('eventGroupAdd.groupRemoved.error', 'Failed to remove group'));
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
						'Members of the group "{GROUP}" can now edit the "{EVENT}" event.',
						{ GROUP: groupName, EVENT: event.title },
					),
				);
				instance.collapse();
			} catch (err) {
				Alert.serverError(
					err,
					i18n('eventGroupAdd.membersCanEditEvent.error', 'Failed to give group editing rights'),
				);
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
						'Members of the group "{GROUP}" can no longer edit the "{EVENT}" event.',
						{ GROUP: groupName, EVENT: event.title },
					),
				);
				instance.collapse();
			} catch (err) {
				Alert.serverError(
					err,
					i18n(
						'eventGroupAdd.membersCanNoLongerEditEvent.error',
						'Failed to remove organizer status',
					),
				);
			}
		},
	});
}

{
	const Template = TemplateAny as TemplateStaticTyped<'eventNotFound'>;
	const template = Template.eventNotFound;

	template.events({
		'click .js-login'() {
			$('.js-account-tasks').modal('show');
		},
	});
}

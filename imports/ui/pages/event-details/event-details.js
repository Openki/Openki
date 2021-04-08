import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { mf } from 'meteor/msgfmt:core';
import { _ } from 'meteor/underscore';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Alert } from '/imports/api/alerts/alert';
import Courses from '/imports/api/courses/courses';
import Events from '/imports/api/events/events';
import Groups from '/imports/api/groups/groups';
import { Regions } from '/imports/api/regions/regions';

import GroupNameHelpers from '/imports/ui/lib/group-name-helpers';
import LocationTracker from '/imports/ui/lib/location-tracker';
import { PleaseLogin } from '/imports/ui/lib/please-login';
import SaveAfterLogin from '/imports/ui/lib/save-after-login';
import TemplateMixins from '/imports/ui/lib/template-mixins';

import IdTools from '/imports/utils/id-tools';
import Metatags from '/imports/utils/metatags';

import { Analytics } from '/imports/ui/lib/analytics';

import '/imports/ui/components/buttons/buttons';
import '/imports/ui/components/courses/categories/course-categories';
import '/imports/ui/components/events/edit/event-edit';
import '/imports/ui/components/events/participants/event-participants';
import '/imports/ui/components/events/replication/event-replication';
import '/imports/ui/components/groups/list/group-list';
import '/imports/ui/components/price-policy/price-policy';
import '/imports/ui/components/regions/tag/region-tag';
import '/imports/ui/components/sharing/sharing';
import '/imports/ui/components/report/report';
import '/imports/ui/components/venues/link/venue-link';

import './event-details.html';


/** Checks if there is enough data ro make a reasonable jsonLd
  *
  * @param {Object} data the event data
  * @return {boolean}
  */
const checkJsonLdMinReqs = (data) => Object.prototype.hasOwnProperty.call(data, 'title')
	&& Object.prototype.hasOwnProperty.call(data, 'startLocal')
	&& Object.prototype.hasOwnProperty.call(data, 'endLocal')
	&& Object.prototype.hasOwnProperty.call(data, 'venue');


/**
  * @param {Object} data - the event data
  * @return {Object|undefined} - jsonLd geo part
  */
const addGeoToJsonLd = (data) => {
	if (
		Object.prototype.hasOwnProperty.call(data.venue, 'loc')
		&& Object.prototype.hasOwnProperty.call(data.venue.loc, 'coordinates')
		&& data.venue.loc.coordinates.length === 2
	) {
		return {
			'@type': 'GeoCoordinates',
			latitude: data.venue.loc.coordinates[1],
			longitude: data.venue.loc.coordinates[0],
		};
	}
	return undefined;
};


/** add offer information to jsonLd
  *
  * https://developers.google.com/search/docs/data-types/event
  *
  * @param {Object} data - the event data
  * @return {Object} - jsonLd-fragment for offers
  */
const addOffersToJsonLd = (data) => ({ '@type': 'AggregateOffer', price: data.price || 'free' });


/** add performer information to jsonLd. use groups as perfomers,
  * if no groups are present createdby is assumed as performer.
  *
  * @return {Object} - jsonLd-fragment for performer
  */
const addPerformerToJsonLd = () => ({
	'@type': 'PerformingGroup',
	name: 'co-created',
});


/** creates the jsonLd
  *
  * @param {Object} data - the event data
  * @return {Object} - jsonLd
  */
const createJsonLd = (data) => {
	const ldObject = {
		'@context': 'https://schema.org',
		'@type': 'Event',
		name: data.title,
		startDate: data.startLocal,
		endDate: data.endLocal,
		location: {
			'@type': 'Place',
			address: {
				'@type': 'PostalAddress',
				addressLocality: data.venue.name,
			},
			name: data.venue.name,
		},
		description: data.description || data.title,
		image: Meteor.absoluteUrl(`logo/${Meteor.settings.public.ogLogo?.src || 'openki_logo_2018.png'}`),
		offers: addOffersToJsonLd(data),
		performer: addPerformerToJsonLd(data),
	};
	ldObject.location.geo = addGeoToJsonLd(data);
	return ldObject;
};


/** Adds a jsonLd to the eventDetails html-template
  *
  * @param {Object} data - the event data
  */
const addJsonLd = (data) => {
	if (checkJsonLdMinReqs(data)) {
		$(document).ready(() => {
			const jsonLdTag = document.createElement('script');
			jsonLdTag.type = 'application/ld+json';
			const jsonLd = createJsonLd(data);
			const jsonLdTextNode = document.createTextNode(JSON.stringify(jsonLd, null, 4));
			jsonLdTag.appendChild(jsonLdTextNode);
			$('body').append(jsonLdTag);
		});
	}
};


Template.eventPage.onCreated(() => {
	const event = Events.findOne(Router.current().params._id);
	let title;
	let description = '';
	if (event) {
		title = mf(
			'event.windowtitle',
			{ EVENT: event.title, DATE: moment(event.start).calendar() },
			'{DATE} - {EVENT}',
		);
		description = mf(
			'event.metatag.description',
			{
				REGION: Regions.findOne(event.region).name,
				VENUE: event.venue.name,
			},
			'{VENUE} in {REGION}',
		);
		addJsonLd(event);
	} else {
		title = mf('event.windowtitle.create', 'Create event');
	}
	Metatags.setCommonTags(title, description);
});


Template.event.onCreated(function () {
	const event = this.data;
	this.busy(false);
	this.editing = new ReactiveVar(!event._id);
	this.subscribe('courseDetails', event.courseId);

	this.addParticipant = () => {
		SaveAfterLogin(this,
			mf('loginAction.enrollEvent', 'Login and enroll for event'),
			mf('registerAction.enrollEvent', 'Login and enroll for event'),
			() => {
				this.busy('registering');
				Meteor.call('event.addParticipant', event._id, (err) => {
					this.busy(false);
					if (err) {
						Alert.serverError(err, '');
					} else {
						Analytics.trackEvent('RSVPs', 'RSVPs as participant', Regions.findOne(event.region)?.nameEn);
					}
				});
			});
	};

	// register from email
	if (Router.current().params.query.action === 'register') {
		this.addParticipant();
	}
});

Template.event.helpers({
	acceptsParticipants() {
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

	isFuture() {
		return moment().isBefore(this.end);
	},

	userRegisteredForEvent() {
		return this.participants?.includes(Meteor.userId());
	},
});

Template.event.events({
	'mouseover .event-course-header, mouseout .event-course-header'(event, instance) {
		instance.$(event.currentTarget).toggleClass('highlight', event.type === 'mouseover');
	},

	'click .event-course-header'() { Router.go('showCourse', { _id: this.courseId }); },

	'click .js-event-delete-confirm'(event, instance) {
		const oEvent = instance.data;
		const { title, region } = oEvent;
		const course = oEvent.courseId;
		instance.busy('deleting');
		Meteor.call('event.remove', oEvent._id, (err) => {
			instance.busy(false);
			if (err) {
				Alert.serverError(
					err,
					'Could not remove event',
				);
			} else {
				Alert.success(mf(
					'eventDetails.eventRemoved',
					{ TITLE: title },
					'The event "{TITLE}" has been deleted.',
				));

				Analytics.trackEvent('Event deletions', 'Event deletions as team', Regions.findOne(region)?.nameEn);

				if (course) {
					Router.go('showCourse', { _id: course });
				} else {
					Router.go('/');
				}
			}
		});
		Template.instance().editing.set(false);
	},

	'click .js-event-edit'(event, instance) {
		if (PleaseLogin()) {
			return;
		}
		instance.editing.set(true);
	},

	'click .js-register-event'(event, instance) {
		instance.addParticipant();
	},

	'click .js-unregister-event'(event, instance) {
		instance.busy('unregistering');
		Meteor.call('event.removeParticipant', instance.data._id, (err) => {
			instance.busy(false);
			if (err) {
				Alert.serverError(err, 'could not remove participant');
			} else {
				Analytics.trackEvent('Unsubscribes RSVPs', 'Unsubscribes RSVPs as participant', Regions.findOne(instance.data.region)?.nameEn);
			}
		});
	},
});


TemplateMixins.Expandible(Template.eventDisplay);
Template.eventDisplay.onCreated(function () {
	this.locationTracker = LocationTracker();
	this.replicating = new ReactiveVar(false);
});

Template.eventDisplay.onRendered(function () {
	this.locationTracker.setRegion(this.data.region);
	this.locationTracker.setLocation(this.data.venue);
});

Template.eventDisplay.helpers({
	mayEdit() {
		return this.editableBy(Meteor.user());
	},
	eventMarkers() {
		return Template.instance().locationTracker.markers;
	},
	hasVenue() {
		return this.venue?.loc;
	},
	replicating() {
		return Template.instance().replicating.get();
	},
});


Template.eventDisplay.events({
	'click .js-show-replication'(event, instance) {
		instance.replicating.set(true);
		instance.collapse();
	},

	'click .js-track-cal-download'(event, instance) {
		Analytics.trackEvent('Events downloads', 'Event downloads via event details', Regions.findOne(instance.data.region)?.nameEn);
	},
});


Template.eventGroupList.helpers({
	isOrganizer() {
		return Template.instance().data.editors.indexOf(IdTools.extract(this)) >= 0;
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
					toolTemplate: Template.eventGroupRemove,
					groupId,
					event,
				});
			}
			if (ownGroup && event.editableBy(user)) {
				const hasOrgRights = event.groupOrganizers.includes(groupId);
				tools.push({
					toolTemplate: hasOrgRights
						? Template.eventGroupRemoveOrganizer
						: Template.eventGroupMakeOrganizer,
					groupId,
					event,
				});
			}
		}
		return tools;
	},
});


TemplateMixins.Expandible(Template.eventGroupAdd);
Template.eventGroupAdd.helpers(GroupNameHelpers);
Template.eventGroupAdd.helpers({
	groupsToAdd() {
		const user = Meteor.user();
		return user && _.difference(user.groups, this.allGroups);
	},
});


Template.eventGroupAdd.events({
	'click .js-add-group'(e, instance) {
		const event = instance.data;
		const groupId = e.currentTarget.value;
		Meteor.call('event.promote', event._id, groupId, true, (err) => {
			if (err) {
				Alert.serverError(
					err,
					'Failed to add group',
				);
			} else {
				const groupName = Groups.findOne(groupId).name;
				Alert.success(mf(
					'eventGroupAdd.groupAdded',
					{ GROUP: groupName, EVENT: event.title },
					'The group "{GROUP}" has been added to promote the event "{EVENT}".',
				));
				instance.collapse();
			}
		});
	},
});


TemplateMixins.Expandible(Template.eventGroupRemove);
Template.eventGroupRemove.helpers(GroupNameHelpers);
Template.eventGroupRemove.events({
	'click .js-remove'(e, instance) {
		const { event } = instance.data;
		const { groupId } = instance.data;
		Meteor.call('event.promote', event._id, groupId, false, (err) => {
			if (err) {
				Alert.serverError(
					err,
					'Failed to remove group',
				);
			} else {
				const groupName = Groups.findOne(groupId).name;
				Alert.success(mf(
					'eventGroupAdd.groupRemoved',
					{ GROUP: groupName, EVENT: event.title },
					'The group "{GROUP}" has been removed from the event "{EVENT}".',
				));
				instance.collapse();
			}
		});
	},
});

TemplateMixins.Expandible(Template.eventGroupMakeOrganizer);
Template.eventGroupMakeOrganizer.helpers(GroupNameHelpers);
Template.eventGroupMakeOrganizer.events({
	'click .js-makeOrganizer'(e, instance) {
		const { event } = instance.data;
		const { groupId } = instance.data;
		Meteor.call('event.editing', event._id, groupId, true, (err) => {
			if (err) {
				Alert.serverError(
					err,
					'Failed to give group editing rights',
				);
			} else {
				const groupName = Groups.findOne(groupId).name;
				Alert.success(mf(
					'eventGroupAdd.membersCanEditEvent',
					{ GROUP: groupName, EVENT: event.title },
					'Members of the group "{GROUP}" can now edit the event "{EVENT}".',
				));
				instance.collapse();
			}
		});
	},
});

TemplateMixins.Expandible(Template.eventGroupRemoveOrganizer);
Template.eventGroupRemoveOrganizer.helpers(GroupNameHelpers);
Template.eventGroupRemoveOrganizer.events({
	'click .js-removeOrganizer'(e, instance) {
		const { event } = instance.data;
		const { groupId } = instance.data;
		Meteor.call('event.editing', event._id, groupId, false, (err) => {
			const groupName = Groups.findOne(groupId).name;
			if (err) {
				Alert.serverError(
					err,
					'Failed to remove organizer status',
				);
			} else {
				Alert.success(mf(
					'eventGroupAdd.membersCanNoLongerEditEvent',
					{ GROUP: groupName, EVENT: event.title },
					'Members of the group "{GROUP}" can no longer edit the event "{EVENT}".',
				));
				instance.collapse();
			}
		});
	},
});

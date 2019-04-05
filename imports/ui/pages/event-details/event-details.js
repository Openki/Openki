import Regions from '/imports/api/regions/regions.js';
import Courses from '/imports/api/courses/courses.js';
import Events from '/imports/api/events/events.js';
import IdTools from '/imports/utils/id-tools.js';
import GroupNameHelpers from '/imports/ui/lib/group-name-helpers.js';
import PleaseLogin from '/imports/ui/lib/please-login.js';
import LocationTracker from '/imports/ui/lib/location-tracker.js';
import TemplateMixins from '/imports/ui/lib/template-mixins.js';
import Alert from '/imports/api/alerts/alert.js';

import '/imports/ui/components/buttons/buttons.js';
import '/imports/ui/components/courses/categories/course-categories.js';
import '/imports/ui/components/events/edit/event-edit.js';
import '/imports/ui/components/events/participants/event-participants.js';
import '/imports/ui/components/events/replication/event-replication.js';
import '/imports/ui/components/groups/list/group-list.js';
import '/imports/ui/components/price-policy/price-policy.js';
import '/imports/ui/components/regions/tag/region-tag.js';
import '/imports/ui/components/sharing/sharing.js';
import '/imports/ui/components/report/report.js';
import '/imports/ui/components/venues/link/venue-link.js';

import './event-details.html';

Template.eventPage.onCreated(function eventPageOnCreated() {
	const event = Events.findOne(Router.current().params._id);
	let title;
	let description = '';
	if (event) {
		title = mf(
			'event.windowtitle',
			{ EVENT:event.title, DATE: moment(event.start).calendar() },
			'{DATE} - {EVENT}'
		);
		description = mf(
			'event.metatag.description',
			{ REGION: Regions.findOne(event.region).name
			, VENUE: event.venue.name },
			'{VENUE} in {REGION}'
		);
	} else {
		title = mf('event.windowtitle.create', 'Create event');
	}
	Metatags.setCommonTags(title, description);
});

Template.event.onCreated(function() {
	const event = this.data;
	this.busy(false);
	this.editing = new ReactiveVar(!event._id);
	this.subscribe('courseDetails', event.courseId);

	this.userRegisteredForEvent = new ReactiveVar(false);

	this.autorun(()=> {
		this.userRegisteredForEvent.set(
			event.participants && event.participants.includes(Meteor.userId())
		);
	});
});

Template.event.helpers({
	course() {
		if (this.courseId) return Courses.findOne(this.courseId);
	},

	editing() {
		return this.new || Template.instance().editing.get();
	},

	userRegisteredForEvent() {
		return Template.instance().userRegisteredForEvent.get();
	}
});

Template.eventDisplay.helpers({
	weekday(date) {
		Session.get('timeLocale'); // it depends
		if (date) return moment(date).format('dddd');
	},

	mayEdit() {
		return this.editableBy(Meteor.user());
	},
	eventMarkers() {
		return Template.instance().locationTracker.markers;
	},
	hasVenue() {
		return this.venue && this.venue.loc;
	},

	replicating() {
		return Template.instance().replicating.get();
	},
});

Template.event.events({
	'mouseover .event-course-header, mouseout .event-course-header'(event, instance) {
		instance.$(event.currentTarget).toggleClass('highlight', event.type == 'mouseover');
	},

	'click .event-course-header'() { Router.go('showCourse', { _id: this.courseId }); },

	'click .js-event-delete-confirm': function (event, instance) {
		var oEvent = instance.data;
		var title = oEvent.title;
		var course = oEvent.courseId;
		instance.busy('deleting');
		Meteor.call('event.remove', oEvent._id, function (error) {
			instance.busy(false);
			if (error) {
				Alert.error(error, 'Could not remove event ' + "'" + title + "'");
			} else {
				Alert.success(mf(
					'eventDetails.eventRemoved',
					{ TITLE: title },
					'The event "{TITLE}" has been deleted.'
				));
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
		if (PleaseLogin()) return;
		instance.editing.set(true);
	},

	'click .js-register-event'(event, instance) {
		if (PleaseLogin()) return;

		Meteor.call('event.addParticipant', instance.data._id, Meteor.userId(), (err) => {
			if ( err ) {
				Alert.error( err, '');
			} else {
				instance.userRegisteredForEvent.set(true);
			}
		});
	},

	'click .js-unregister-event'(event, instance) {
		Meteor.call('event.removeParticipant', instance.data._id, Meteor.userId(), (err) => {
			if ( err ) {
				Alert.error( err, '');
			} else {
				instance.userRegisteredForEvent.set(false);
			}
		});
	},
});

TemplateMixins.Expandible(Template.eventDisplay);
Template.eventDisplay.onCreated(function() {
	this.locationTracker = LocationTracker();
	this.replicating = new ReactiveVar(false);
});


Template.eventDisplay.onRendered(function() {
	this.locationTracker.setRegion(this.data.region);
	this.locationTracker.setLocation(this.data.venue);
});

Template.eventDisplay.helpers({
	weekday(date) {
		Session.get('timeLocale'); // it depends
		if (date) return moment(date).format('dddd');
	},

	mayEdit() {
		return this.editableBy(Meteor.user());
	},
	eventMarkers() {
		return Template.instance().locationTracker.markers;
	},
	hasVenue() {
		return this.venue && this.venue.loc;
	},

	replicating() {
		return Template.instance().replicating.get();
	},
});

TemplateMixins.Expandible(Template.eventDisplay);
Template.eventDisplay.onCreated(function() {
	this.locationTracker = LocationTracker();
	this.replicating = new ReactiveVar(false);
});


Template.eventDisplay.onRendered(function() {
	this.locationTracker.setRegion(this.data.region);
	this.locationTracker.setLocation(this.data.venue);
});

Template.eventDisplay.helpers({
	weekday(date) {
		Session.get('timeLocale'); // it depends
		if (date) return moment(date).format('dddd');
	},

	mayEdit() {
		return this.editableBy(Meteor.user());
	},
	eventMarkers() {
		return Template.instance().locationTracker.markers;
	},
	hasVenue() {
		return this.venue && this.venue.loc;
	},

	replicating() {
		return Template.instance().replicating.get();
	},
});

Template.eventDisplay.events({
	'click .js-show-replication'(event, instance) {
		instance.replicating.set(true);
		instance.collapse();
	}
});



Template.eventGroupList.helpers({
	'isOrganizer'() {
		return Template.instance().data.editors.indexOf(IdTools.extract(this)) >= 0;
	},
	'tools'() {
		var tools = [];
		var user = Meteor.user();
		if (user) {
			var groupId = String(this);
			var event = Template.parentData();

			// Groups may be adopted from the course, these cannot be removed
			var ownGroup = event.groups.indexOf(groupId) >= 0;

			if (ownGroup && (user.mayPromoteWith(groupId) || event.editableBy(user))) {
				tools.push({
					toolTemplate: Template.eventGroupRemove,
					groupId: groupId,
					event: event,
				});
			}
			if (ownGroup && event.editableBy(user)) {
				var hasOrgRights = event.groupOrganizers.indexOf(groupId) > -1;
				tools.push({
					toolTemplate: hasOrgRights ? Template.eventGroupRemoveOrganizer : Template.eventGroupMakeOrganizer,
					groupId: groupId,
					event: event,
				});
			}
		}
		return tools;
	},
});


TemplateMixins.Expandible(Template.eventGroupAdd);
Template.eventGroupAdd.helpers(GroupNameHelpers);
Template.eventGroupAdd.helpers({
	'groupsToAdd'() {
		var user = Meteor.user();
		return user && _.difference(user.groups, this.allGroups);
	}
});


Template.eventGroupAdd.events({
	'click .js-add-group'(e, instance) {
		const event = instance.data;
		const groupId = e.currentTarget.value;
		Meteor.call('event.promote', event._id, groupId, true, function(error) {
			if (error) {
				Alert.error(error, 'Failed to add group');
			} else {
				const groupName = Groups.findOne(groupId).name;
				Alert.success(mf(
					'eventGroupAdd.groupAdded',
					{ GROUP: groupName, EVENT: event.title },
					'The group "{GROUP}" has been added to promote the event "{EVENT}".'
				));
				instance.collapse();
			}
		});
	}
});


TemplateMixins.Expandible(Template.eventGroupRemove);
Template.eventGroupRemove.helpers(GroupNameHelpers);
Template.eventGroupRemove.events({
	'click .js-remove'(e, instance) {
		const event = instance.data.event;
		const groupId = instance.data.groupId;
		Meteor.call('event.promote', event._id, groupId, false, function(error) {
			if (error) {
				Alert.error(error, 'Failed to remove group');
			} else {
				const groupName = Groups.findOne(groupId).name;
				Alert.success(mf(
					'eventGroupAdd.groupRemoved',
					{ GROUP: groupName, EVENT: event.title },
					'The group "{GROUP}" has been removed from the event "{EVENT}".'
				));
				instance.collapse();
			}
		});
	}
});

TemplateMixins.Expandible(Template.eventGroupMakeOrganizer);
Template.eventGroupMakeOrganizer.helpers(GroupNameHelpers);
Template.eventGroupMakeOrganizer.events({
	'click .js-makeOrganizer'(e, instance) {
		const event = instance.data.event;
		const groupId = instance.data.groupId;
		Meteor.call('event.editing', event._id, groupId, true, function(error) {
			if (error) {
				Alert.error(error, 'Failed to give group editing rights');
			} else {
				const groupName = Groups.findOne(groupId).name;
				Alert.success(mf(
					'eventGroupAdd.membersCanEditEvent',
					{ GROUP: groupName, EVENT: event.title },
					'Members of the group "{GROUP}" can now edit the event "{EVENT}".'
				));
				instance.collapse();
			}
		});
	}
});

TemplateMixins.Expandible(Template.eventGroupRemoveOrganizer);
Template.eventGroupRemoveOrganizer.helpers(GroupNameHelpers);
Template.eventGroupRemoveOrganizer.events({
	'click .js-removeOrganizer'(e, instance) {
		const event = instance.data.event;
		const groupId = instance.data.groupId;
		Meteor.call('event.editing', event._id, groupId, false, function(error) {
			if (error) {
				Alert.error(error, 'Failed to remove organizer status');
			} else {
				const groupName = Groups.findOne(groupId).name;
				Alert.success(mf(
					'eventGroupAdd.membersCanNoLongerEditEvent',
					{ GROUP: groupName, EVENT: event.title },
					'Members of the group "{GROUP}" can no longer edit the event "{EVENT}".'
				));
				instance.collapse();
			}
		});
	}
});

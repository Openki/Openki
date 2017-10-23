import '/imports/IdTools.js';
import { PleaseLogin } from '/imports/ui/lib/please-login.js';

// routing is in /routing.js

Template.eventPage.onCreated(function eventPageOnCreated() {
	const event = Events.findOne(Router.current().params._id);
	let title;
	let description = '';
	if (event) {
		title = mf(
			'event.windowtitle',
			{ EVENT:event.title, DATE: moment(event.start).calendar() },
			'{DATE} {EVENT}'
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

Template.event.helpers({
	course() {
		if (this.courseId) return Courses.findOne(this.courseId);
	},

	editing: function() {
		return this.new || Template.instance().editing.get();
	},
});


Template.eventDisplay.helpers({
	mayEdit: function() {
		return this.editableBy(Meteor.user());
	},
	eventMarkers: function() {
		return Template.instance().locationTracker.markers;
	},
	hasVenue: function() {
		return this.venue && this.venue.loc;
	},

	replicating: function() {
		return Template.instance().replicating.get();
	},
});

Template.event.events({
	'mouseover .event-course-header, mouseout .event-course-header'(e, instance) {
		instance.$(e.currentTarget).toggleClass('highlight', e.type == 'mouseover');
	},

	'click .event-course-header'() { Router.go('showCourse', { _id: this.courseId }); },

	'click .js-event-delete-confirm': function (e, instance) {
		var event = instance.data;

		var title = event.title;
		var course = event.courseId;
		instance.busy('deleting');
		Meteor.call('removeEvent', event._id, function (error) {
			instance.busy(false);
			if (error) {
				showServerError('Could not remove event ' + "'" + title + "'", error);
			} else {
				addMessage("\u2713 " + mf('_message.removed'), 'success');
				if (course) {
					Router.go('showCourse', { _id: course });
				} else {
					Router.go('/');
				}
			}
		});
		Template.instance().editing.set(false);
	},

	'click .js-event-edit': function (event, instance) {
		if (PleaseLogin()) return;
		instance.editing.set(true);
	},
});

Template.eventDisplay.events({
	'click .js-show-replication': function(event, instance) {
		instance.replicating.set(true);
		instance.collapse();
	}
});



Template.eventGroupList.helpers({
	'isOrganizer': function() {
		return Template.instance().data.editors.indexOf(IdTools.extract(this)) >= 0;
	},
	'tools': function() {
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
Template.eventGroupAdd.helpers(groupNameHelpers);
Template.eventGroupAdd.helpers({
	'groupsToAdd': function() {
		var user = Meteor.user();
		return user && _.difference(user.groups, this.allGroups);
	}
});


Template.eventGroupAdd.events({
	'click .js-add-group': function(event, instance) {
		Meteor.call('event.promote', instance.data._id, event.currentTarget.value, true, function(error) {
			if (error) {
				showServerError('Failed to add group', error);
			} else {
				addMessage("\u2713 " + mf('_message.added'), 'success');
				instance.collapse();
			}
		});
	}
});


TemplateMixins.Expandible(Template.eventGroupRemove);
Template.eventGroupRemove.helpers(groupNameHelpers);
Template.eventGroupRemove.events({
	'click .js-remove': function(event, instance) {
		Meteor.call('event.promote', instance.data.event._id, instance.data.groupId, false, function(error) {
			if (error) {
				showServerError('Failed to remove group', error);
			} else {
				addMessage("\u2713 " + mf('_message.removed'), 'success');
				instance.collapse();
			}
		});
	}
});


TemplateMixins.Expandible(Template.eventGroupMakeOrganizer);
Template.eventGroupMakeOrganizer.helpers(groupNameHelpers);
Template.eventGroupMakeOrganizer.events({
	'click .js-makeOrganizer': function(event, instance) {
		Meteor.call('event.editing', instance.data.event._id, instance.data.groupId, true, function(error) {
			if (error) {
				showServerError('Failed to give group editing rights', error);
			} else {
				addMessage("\u2713 " + mf('_message.added'), 'success');
				instance.collapse();
			}
		});
	}
});


TemplateMixins.Expandible(Template.eventGroupRemoveOrganizer);
Template.eventGroupRemoveOrganizer.helpers(groupNameHelpers);
Template.eventGroupRemoveOrganizer.events({
	'click .js-removeOrganizer': function(event, instance) {
		Meteor.call('event.editing', instance.data.event._id, instance.data.groupId, false, function(error) {
			if (error) {
				showServerError('Failed to remove organizer status', error);
			} else {
				addMessage("\u2713 " + mf('_message.removed'), 'success');
				instance.collapse();
			}
		});
	}
});

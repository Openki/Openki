// routing is in /routing.js

Template.event.onCreated(function() {
	this.editing = new ReactiveVar(!this.data._id);
});


Template.eventDisplay.onCreated(function() {
	this.locationTracker = LocationTracker();
	this.replicating = new ReactiveVar(false);
});


Template.eventDisplay.onRendered(function() {
	this.locationTracker.setRegion(this.data.region);
	this.locationTracker.setLocation(this.data.location);
});


Template.eventPage.helpers({
	course: function() {
		var courseId = this.courseId;
		if (courseId) {
			// Very bad?
			Template.instance().subscribe('courseDetails', courseId);

			return Courses.findOne({_id: courseId});
		}
	},
});


Template.event.helpers({
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
	haveLocation: function() {
		return this.location && this.location.loc;
	},

	replicating: function() {
		return Template.instance().replicating.get();
	}
});

Template.event.events({
	'click .js-event-delete': function (e, instance) {
		var event = instance.data;
		
		var title = event.title;
		var course = event.courseId;
		if (confirm(mf('event.removeConfirm', { TITLE: title }, 'Delete event {TITLE}?'))) {
			Meteor.call('removeEvent', event._id, function (error) {
				if (error) {
					showServerError('Could not remove event ' + "'" + title + "'", error);
				} else {
					addMessage(mf('event.removed', { TITLE: title }, 'Successfully removed event "{TITLE}".'), 'success');
					if (course) {
						Router.go('showCourse', { _id: course });
					} else {
						Router.go('/');
					}
				}
			});
			Template.instance().editing.set(false);
		}
	},

	'click .js-event-edit': function (event, instance) {
		if (pleaseLogin()) return;
		instance.editing.set(true);
	},
});

Template.eventDisplay.events({
	'click .-openReplication': function(event, instance) {
		instance.replicating.set(true);
	},

	'click .-closeReplication': function(event, instance) {
		instance.replicating.set(false);
	},
});



Template.eventGroupList.helpers({
	'isOrganizer': function() {
		return Template.instance().data.editors.indexOf(_id(this)) >= 0;
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
		Meteor.call('event.promote', instance.data._id, event.target.value, true, function(error) {
			if (error) {
				showServerError('Failed to add group', error);
			} else {
				addMessage(mf('course.group.addedGroup'), 'success');
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
				addMessage(mf('course.group.removedGroup'), 'success');
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
				addMessage(mf('course.group.groupMadeOrganizer'), 'success');
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
				addMessage(mf('course.group.removedOrganizer'), 'success');
				instance.collapse();
			}
		});
	}
});

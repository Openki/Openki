TemplateMixins.Expandible(Template.courseDetailsPage);
Template.courseDetailsPage.onCreated(function() {
	var instance = this;

	instance.busy(false);

	var course = instance.data.course;

	instance.editableName = Editable(
		true,
		function(newName) {
			Meteor.call("save_course", course._id, { name: newName }, function(err, courseId) {
				if (err) {
					showServerError('Saving the course went wrong', err);
				} else {
					addMessage("\u2713 " + mf('_message.saved'), 'success');
				}
			});
		},
		mf('course.title.placeholder')
	);

	instance.editableDescription = Editable(
		false,
		function(newDescription) {
			Meteor.call("save_course", course._id, { description: newDescription }, function(err, courseId) {
				if (err) {
					showServerError('Saving the course went wrong', err);
				} else {
					addMessage("\u2713 " + mf('_message.saved'), 'success');
				}
			});
		},
		mf('course.description.placeholder')
	);

	this.autorun(function() {
		var data = Template.currentData();
		var course = data.course;
		var editingPermitted = course.editableBy(Meteor.user());

		data.editableName = editingPermitted && instance.editableName;
		data.editableDescription = editingPermitted && instance.editableDescription;

		instance.editableName.setText(course.name);
		instance.editableDescription.setText(course.description);
	});
});

Template.courseDetailsPage.helpers({    // more helpers in course.roles.js
	currentUserMayEdit: function() {
		return this.editableBy(Meteor.user());
	},
	coursestate: function() {
		if (this.nextEvent) return 'has-upcoming-events';
		if (this.lastEvent) return 'has-past-events';
		return 'is-proposal';
	},
	mobileViewport: function() {
		var viewportWidth = Session.get('viewportWidth');
		var screenMD = SCSSVars.screenMD;
		return viewportWidth <= screenMD;
	},
	isProposal: function() {
		return !this.course.nextEvent && !this.course.lastEvent;
	},
});

Template.courseDetailsPage.events({
	'click .js-delete-course-confirm': function (event, instance) {
		if (pleaseLogin()) return;

		var course = instance.data.course;
		instance.busy('deleting');
		Meteor.call('remove_course', course._id, function(error) {
			instance.busy(false);
			if (error) {
				showServerError("Removing the proposal '"+ course.name + "' went wrong", error);
			} else {
				addMessage("\u2713 " + mf('_message.removed'), 'success');
			}
		});
		Router.go('/');
	},

	'click .js-course-edit': function (event, instance) {
		instance.collapse();
		if (pleaseLogin()) return;

		var course = instance.data.course;
		Router.go('showCourse', course, { query: {edit: 'course'} });
	}
});


Template.courseGroupList.helpers({
	'isOrganizer': function() {
		return Template.instance().data.groupOrganizers.indexOf(_id(this)) >= 0;
	},
	'tools': function() {
		var tools = [];
		var user = Meteor.user();
		var groupId = String(this);
		var course = Template.parentData();
		if (user && user.mayPromoteWith(groupId) || course.editableBy(user)) {
			tools.push({
				toolTemplate: Template.courseGroupRemove,
				groupId: groupId,
				course: course,
			});
		}
		if (user && course.editableBy(user)) {
			var hasOrgRights = course.groupOrganizers.indexOf(groupId) > -1;
			tools.push({
				toolTemplate: hasOrgRights ? Template.courseGroupRemoveOrganizer : Template.courseGroupMakeOrganizer,
				groupId: groupId,
				course: course,
			});
		}
		return tools;
	},
});



TemplateMixins.Expandible(Template.courseGroupAdd);
Template.courseGroupAdd.helpers(groupNameHelpers);
Template.courseGroupAdd.helpers({
	'groupsToAdd': function() {
		var user = Meteor.user();
		return user && _.difference(user.groups, this.groups);
	}
});


Template.courseGroupAdd.events({
	'click .js-add-group': function(event, instance) {
		Meteor.call('course.promote', instance.data._id, event.currentTarget.value, true, function(error) {
			if (error) {
				showServerError("Failed to add group", error);
			} else {
				addMessage("\u2713 " + mf('_message.added'), 'success');
				instance.collapse();
			}
		});
	}
});


TemplateMixins.Expandible(Template.courseGroupRemove);
Template.courseGroupRemove.helpers(groupNameHelpers);
Template.courseGroupRemove.events({
	'click .js-remove': function(event, instance) {
		Meteor.call('course.promote', instance.data.course._id, instance.data.groupId, false, function(error) {
			if (error) {
				showServerError("Failed to remove group", error);
			} else {
				addMessage("\u2713 " + mf('_message.removed'), 'success');
				instance.collapse();
			}
		});
	}
});


TemplateMixins.Expandible(Template.courseGroupMakeOrganizer);
Template.courseGroupMakeOrganizer.helpers(groupNameHelpers);
Template.courseGroupMakeOrganizer.events({
	'click .js-makeOrganizer': function(event, instance) {
		Meteor.call('course.editing', instance.data.course._id, instance.data.groupId, true, function(error) {
			if (error) {
				showServerError("Failed to give group editing rights", error);
			} else {
				addMessage("\u2713 " + mf('_message.added'), 'success');
				instance.collapse();
			}
		});
	}
});


TemplateMixins.Expandible(Template.courseGroupRemoveOrganizer);
Template.courseGroupRemoveOrganizer.helpers(groupNameHelpers);
Template.courseGroupRemoveOrganizer.events({
	'click .js-removeOrganizer': function(event, instance) {
		Meteor.call('course.editing', instance.data.course._id, instance.data.groupId, false, function(error) {
			if (error) {
				showServerError("Failed to remove organizer status", error);
			} else {
				addMessage("\u2713 " + mf('_message.removed'), 'success');
				instance.collapse();
			}
		});
	}
});

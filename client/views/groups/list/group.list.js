Template.groupName.helpers(groupNameHelpers);

Template.groupNameFull.helpers(groupNameHelpers);

Template.detailsGroupList.onCreated = function(){
	//  console.log(this);
};

Template.detailsGroupList.helpers({
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
				toolTemplate: Template.detailsGroupRemove,
				groupId: groupId,
				course: course,
			});
		}
		if (user && course.editableBy(user)) {
			var hasOrgRights = course.groupOrganizers.indexOf(groupId) > -1;
			tools.push({
				toolTemplate: hasOrgRights ? Template.detailsGroupRemoveOrganizer : Template.detailsGroupMakeOrganizer,
				groupId: groupId,
				course: course,
			});
		}
		return tools;
	},
});

TemplateMixins.Expandible(Template.detailsGroupAdd);
Template.detailsGroupAdd.helpers(groupNameHelpers);
Template.detailsGroupAdd.helpers({
	'groupsToAdd': function() {
		var user = Meteor.user();
		return user && _.difference(user.groups, this.groups);
	}
});

Template.detailsGroupAdd.events({
	'click .js-add-group': function(event, instance) {
		Meteor.call('course.promote', instance.data._id, event.target.value, true, function(error) {
			if (error) {
				addMessage(mf('course.group.addFailed', "Failed to add group"), 'danger');
			} else {
				addMessage(mf('course.group.addedGroup', "Added your group to the list of promoters"), 'success');
				instance.collapse();
			}
		});
	}
});

TemplateMixins.Expandible(Template.detailsGroupRemove);
Template.detailsGroupRemove.helpers(groupNameHelpers);
Template.detailsGroupRemove.events({
	'click .js-remove': function(event, instance) {
		Meteor.call('course.promote', instance.data.course._id, instance.data.groupId, false, function(error) {
			if (error) {
				addMessage(mf('course.group.removeFailed', "Failed to remove group"), 'danger');
			} else {
				addMessage(mf('course.group.removedGroup', "Removed group from the list of promoters"), 'success');
				instance.collapse();
			}
		});
	}
});

TemplateMixins.Expandible(Template.detailsGroupMakeOrganizer);
Template.detailsGroupMakeOrganizer.helpers(groupNameHelpers);
Template.detailsGroupMakeOrganizer.events({
	'click .js-makeOrganizer': function(event, instance) {
		Meteor.call('course.editing', instance.data.course._id, instance.data.groupId, true, function(error) {
			if (error) {
				addMessage(mf('course.group.makeOrganizerFailed', "Failed to give group editing rights"), 'danger');
			} else {
				addMessage(mf('course.group.groupMadeOrganizer', "Group members can now edit this"), 'success');
				instance.collapse();
			}
		});
	}
});


TemplateMixins.Expandible(Template.detailsGroupRemoveOrganizer);
Template.detailsGroupRemoveOrganizer.helpers(groupNameHelpers);
Template.detailsGroupRemoveOrganizer.events({
	'click .js-removeOrganizer': function(event, instance) {
		Meteor.call('course.editing', instance.data.course._id, instance.data.groupId, false, function(error) {
			if (error) {
				addMessage(mf('course.group.removeOrganizerFailed', "Failed to remove organizer status"), 'danger');
			} else {
				addMessage(mf('course.group.removedOrganizer', "Removed editing rights"), 'success');
				instance.collapse();
			}
		});
	}
});

Template.groupListing.helpers({
	available: function() {
		return GroupLib.find({ own: true });
	},

	inGroup: function(group, course) {
		return course.groups && course.groups.indexOf(group._id) >= 0;
	}
});

Template.groupListing.onCreated(function() {
	this.subscribe('groupsFind', { own: true });
});

Template.groupListing.events({
	'click button.-admitToGroup': function(event, instance) {
		event.preventDefault();
		var groupId = this._id;
		var name = this.name;
		var courseId = instance.data._id;
		Meteor.call('updateGroupListing', courseId, groupId, true, function(err) {
			if (err) {
				addMessage(mf('course.edit.groupListingError', { ERROR: err }, 'Unable add group to course: {ERROR}'), 'danger');
			} else {
				addMessage(mf('course.edit.groupAdded', { NAME: name }, 'Added group {NAME}'), 'success');
			}
		});
		event.stopPropagation();
	},

	'click button.js-group-expel-btn': function(event, instance) {
		event.preventDefault();
		var groupId = this._id;
		var name = this.name;
		var courseId = instance.data._id;
		Meteor.call('updateGroupListing', courseId, groupId, false, function(err) {
			if (err) {
				addMessage(mf('course.edit.groupUnlistingError', { ERROR: err }, 'Unable to remove group: {ERROR}'), 'danger');
			} else {
				addMessage(mf('course.edit.groupRemoved', { NAME: name }, 'Expelled from group {NAME}'), 'success');
			}
		});
		event.stopPropagation();
	},
});

Template.groupListEntry.rendered = function() {
	this.$("[data-toggle='tooltip']").tooltip();
};

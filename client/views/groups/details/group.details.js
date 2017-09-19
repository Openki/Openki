"use strict";

Template.groupDetails.onCreated(function() {
	var instance = this;

	instance.busy(false);

	var groupId = instance.data.group._id;
	instance.mayEdit = new ReactiveVar(false);
	instance.editingSettings = new ReactiveVar(false);

	var handleSaving = function(err, groupId) {
		if (err) {
			showServerError('Saving the group went wrong', err);
		} else {
			addMessage("\u2713 " + mf('_message.saved'), 'success');
		}
	};

	var showControls = !this.data.isNew;

	instance.editableName = Editable(
		true,
		function(newName) {
			Meteor.call("saveGroup", groupId, { name: newName }, handleSaving);
		},
		mf('group.name.placeholder',  'Name of your group, institution, community or program'),
		showControls
	);

	instance.editableShort = Editable(
		true,
		function(newShort) {
			Meteor.call("saveGroup", groupId, { short: newShort }, handleSaving);
		},
		mf('group.short.placeholder', 'Abbreviation'),
		showControls
	);

	instance.editableClaim = Editable(
		true,
		function(newClaim) {
			Meteor.call("saveGroup", groupId, { claim: newClaim }, handleSaving);
		},
		mf('group.claim.placeholder', 'The core idea'),
		showControls
	);

	instance.editableDescription = Editable(
		false,
		function(newDescription) {
			Meteor.call("saveGroup", groupId, { description: newDescription }, handleSaving);
		},
		mf('group.description.placeholder', 'Describe the audience, the interests and activities of your group.'),
		showControls
	);


	instance.autorun(function() {
		var data = Template.currentData();
		var group = Groups.findOne(groupId) || {};
		var userId = Meteor.userId();
		var mayEdit = data.isNew || userId && GroupLib.isMember(userId, groupId);
		instance.mayEdit.set(mayEdit);

		instance.editableName.setText(group.name);
		instance.editableShort.setText(group.short);
		instance.editableClaim.setText(group.claim);
		instance.editableDescription.setText(group.description);
	});
});

Template.groupDetails.helpers({
	headerClasses: function() {
		var classes = [];
		if (this.group.logo) classes.push('has-logo');
		if (Template.instance().mayEdit.get()) classes.push('is-editable');
		return classes.join(' ');
	},
	editableName: function() {
		var instance = Template.instance();
		return instance.mayEdit.get() && instance.editableName;
	},
	editableShort: function() {
		var instance = Template.instance();
		return instance.mayEdit.get() && instance.editableShort;
	},
	hasContent: function() {
		var group = this.group;
		var isNew = this.isNew;
		if (isNew) {
			return true;
		} else {
			return group.claim || group.description;
		}
	},
	editableClaim: function() {
		var instance = Template.instance();
		return instance.mayEdit.get() && instance.editableClaim;
	},
	editableDescription: function() {
		var instance = Template.instance();
		return instance.mayEdit.get() && instance.editableDescription;
	},
	mayEdit: function() {
		var instance = Template.instance();
		return instance.mayEdit.get();
	},
	editingSettings: function() {
		var instance = Template.instance();
		return instance.mayEdit.get() && Template.instance().editingSettings.get();
	},
});

Template.groupDetails.events({
	'click .js-group-settings' : function(event, instance) {
		if (pleaseLogin()) return false;
		instance.editingSettings.set(!instance.editingSettings.get());
	},

	'click .js-group-save': function(event, instance) {

		if (pleaseLogin()) return;

		var group = {};

		group.name = instance.editableName.getEdited();
		group.short = instance.editableShort.getEdited();
		group.claim = instance.editableClaim.getEdited();
		group.description = instance.editableDescription.getEdited();

		instance.busy('saving');
		Meteor.call("saveGroup", "create", group, function(err, groupId) {
			instance.busy(false);
			if (err) {
				showServerError('Saving the group went wrong', err);
			} else {
				instance.editableName.end();
				instance.editableShort.end();
				instance.editableClaim.end();
				instance.editableDescription.end();

				addMessage(mf('group.create.success', 'Created group'), 'success');
				Router.go('groupDetails', { _id: groupId });
			}
		});

	},

	'click .js-group-cancel': function(event, instance) {
		Router.go('/'); // Got a better idea?
	},

	'click .js-group-remove-filter': function(event, instance) {
		Router.go('/'); // Got a better idea?
	}
});

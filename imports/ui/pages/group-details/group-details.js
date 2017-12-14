"use strict";
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';

import Groups from '/imports/api/groups/groups.js';
import PleaseLogin from '/imports/ui/lib/please-login.js';
import Editable from '/imports/ui/lib/editable.js';
import SaveAfterLogin from '/imports/ui/lib/save-after-login.js';
import ShowServerError from '/imports/ui/lib/show-server-error.js';
import { AddMessage } from '/imports/api/messages/methods.js';
import IsGroupMember from '/imports/utils/is-group-member.js';

import '/imports/ui/components/buttons/buttons.js';
import '/imports/ui/components/editable/editable.js';
import '/imports/ui/components/groups/settings/group-settings.js';

import './group-details.html';

Template.groupDetails.onCreated(function() {
	var instance = this;

	instance.busy(false);

	var groupId = instance.data.group._id;
	instance.mayEdit = new ReactiveVar(false);
	instance.editingSettings = new ReactiveVar(false);

	var handleSaving = function(err, groupId) {
		if (err) {
			ShowServerError('Saving the group went wrong', err);
		} else {
			AddMessage("\u2713 " + mf('_message.saved'), 'success');
		}
	};

	var showControls = !this.data.isNew;

	instance.editableName = new Editable(
		true,
		function(newName) {
			Meteor.call("group.save", groupId, { name: newName }, handleSaving);
		},
		mf('group.name.placeholder',  'Name of your group, institution, community or program'),
		showControls
	);

	instance.editableShort = new Editable(
		true,
		function(newShort) {
			Meteor.call("group.save", groupId, { short: newShort }, handleSaving);
		},
		mf('group.short.placeholder', 'Abbreviation'),
		showControls
	);

	instance.editableClaim = new Editable(
		true,
		function(newClaim) {
			Meteor.call("group.save", groupId, { claim: newClaim }, handleSaving);
		},
		mf('group.claim.placeholder', 'The core idea'),
		showControls
	);

	instance.editableDescription = new Editable(
		false,
		function(newDescription) {
			Meteor.call("group.save", groupId, { description: newDescription }, handleSaving);
		},
		mf('group.description.placeholder', 'Describe the audience, the interests and activities of your group.'),
		showControls
	);


	instance.autorun(function() {
		var data = Template.currentData();
		var group = Groups.findOne(groupId) || {};
		var userId = Meteor.userId();
		var mayEdit = data.isNew || userId && IsGroupMember(userId, groupId);
		instance.mayEdit.set(mayEdit);

		instance.editableName.setText(group.name);
		instance.editableShort.setText(group.short);
		instance.editableClaim.setText(group.claim);
		instance.editableDescription.setText(group.description);
	});
});

Template.groupDetails.helpers({
	isFeatured() {
		const region = Regions.findOne(Session.get('region'));
		return region && region.featuredGroup === this.group._id;
	},

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
		if (PleaseLogin()) return false;
		instance.editingSettings.set(!instance.editingSettings.get());
	},

	'click .js-group-save': function(event, instance) {
		const group = {
			name: instance.editableName.getEdited(),
			short: instance.editableShort.getEdited(),
			claim: instance.editableClaim.getEdited(),
			description: instance.editableDescription.getEdited()
		};

		instance.busy('saving');
		SaveAfterLogin(instance, mf('loginAction.saveGroup', 'Login and save group'), () => {
			Meteor.call('group.save', 'create', group, (err, groupId) => {
				instance.busy(false);
				if (err) {
					ShowServerError('Saving the group went wrong', err);
				} else {
					instance.editableName.end();
					instance.editableShort.end();
					instance.editableClaim.end();
					instance.editableDescription.end();

					AddMessage(mf('group.create.success', 'Created group'), 'success');
					Router.go('groupDetails', { _id: groupId });
				}
			});
		});
	},

	'click .js-group-cancel': function(event, instance) {
		Router.go('/'); // Got a better idea?
	},

	'click .js-group-remove-filter': function(event, instance) {
		Router.go('/'); // Got a better idea?
	}
});

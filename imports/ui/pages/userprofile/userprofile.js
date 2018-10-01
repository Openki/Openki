import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import Roles from '/imports/api/roles/roles.js';

import PleaseLogin from '/imports/ui/lib/please-login.js';
import Alert from '/imports/api/alerts/alert.js';
import { HasRoleUser } from '/imports/utils/course-role-utils.js';

import '/imports/ui/components/profiles/course-list/profile-course-list.js';
import '/imports/ui/components/profiles/verify-email/verify-email.js';

import './userprofile.html';

Template.userprofile.helpers({
	// whether userprofile is for the logged-in user
	ownuser: function () {
		return this.user && this.user._id === Meteor.userId();
	},

	acceptsMessages: function() {
		return this.user
			&& this.user.acceptsMessages;
	},

	groupMember: function(group, user) {
		return user && group && group.members && group.members.indexOf(user._id) >= 0;
	},

	showInviteGroups: function() {
		return this.inviteGroups.count && this.inviteGroups.count() > 0;
	},

	showSettings: function() {
		var showPrivileges = Template.instance().data.showPrivileges;
		var showInviteGroups = this.inviteGroups.count && this.inviteGroups.count() > 0;
		return showPrivileges || showInviteGroups;
	},
	roles: function() {
		return _.clone(Roles).reverse();
	},
	coursesByRole: function(role) {
		var templateData = Template.instance().data;
		var involvedIn = templateData.involvedIn;
		var userID = templateData.user._id;
		var coursesForRole = [];

		involvedIn.forEach(function(course) {
			if(!!HasRoleUser(course.members, role, userID)) {
				coursesForRole.push(course);
			}
		});
		return coursesForRole;
	},
	roleUserList: function() {
		return 'roles.'+this.type+'.userList';
	},
	getName: function() {
		return Template.instance().data.user.username;
	}
});


Template.userprofile.events({
	'click button.giveAdmin': function() {
		Meteor.call('user.addPrivilege', this.user._id, 'admin', function(err) {
			if (err) {
				Alert.error(err, 'Unable to add privilege');
			} else {
				Alert.success(mf('privilege.addedAdmin', 'Granted admin privilege'));
			}
		});
	},

	'click .js-remove-privilege-btn': function(event, template) {
		var priv = template.$(event.target).data('priv');
		Meteor.call('user.removePrivilege', this.user._id, priv, function(err) {
			if (err) {
				Alert.error(err, 'Unable to remove privilege');
			} else {
				Alert.success(mf('privilege.removed', 'Removed privilege'));
			}
		});
	},

	'click button.draftIntoGroup': function(event, template) {
		var groupId = this._id;
		var name = this.name;
		var userId = Template.parentData().user._id;
		Meteor.call('group.updateMembership', userId, groupId, true, function(err) {
			if (err) {
				Alert.error(err, 'Unable to draft user into group');
			} else {
				Alert.success(mf('profile.group.drafted', { NAME: name }, 'Added to group {NAME}'));
			}
		});
	},

	'click .js-group-expel-btn': function(event, template) {
		Tooltips.hide();
		var groupId = this._id;
		var name = this.name;
		var userId = Template.parentData().user._id;
		Meteor.call('group.updateMembership', userId, groupId, false, function(err) {
			if (err) {
				Alert.error(err, 'Unable to expel user from group');
			} else {
				Alert.success(mf('profile.group.expelled', { NAME: name }, 'Expelled from group {NAME}'));
			}
		});
	},
});

Template.emailBox.onCreated(function() {
	this.verificationMailSent = new ReactiveVar(false);
	this.busy(false);
});

Template.emailBox.onRendered(function emailBoxOnRendered() {
	this.$('#emailmessage').select();
});

Template.emailBox.helpers({
	hasEmail: function() {
		var user = Meteor.user();
		if (!user) return false;

		var emails = user.emails;
		return emails && emails[0];
	},

	hasVerifiedEmail: function() {
		return Meteor.user().emails[0].verified;
	},

	verificationMailSent: function() {
		return Template.instance().verificationMailSent.get();
	}
});

Template.emailBox.events({
	'click .js-verify-mail': function(e, instance) {
		instance.verificationMailSent.set(true);
		Meteor.call('sendVerificationEmail', function(err) {
			if (err) {
				instance.verificationMailSent.set(false);
				Alert.error(err, 'Failed to send verification mail');
			} else {
				Alert.success(mf('profile.sentVerificationMail'));
			}
		});
	},

	'change .js-send-own-adress': function (event, instance) {
		instance.$('.js-send-own-adress + .checkmark').toggle();
	},

	'change .js-receive-copy': function (event, instance) {
		instance.$('.js-receive-copy + .checkmark').toggle();
	},

	'submit form.sendMail': function (event, template) {
		event.preventDefault();
		if (PleaseLogin()) return;

		var rec_user_id = this.user._id;
		var rec_user = Meteor.users.findOne({_id:rec_user_id});
		if(rec_user){
			if(rec_user.username){
				rec_user = rec_user.username;
			}
		}

		var message = template.$('#emailmessage').val();
		var revealAddress = template.$('#sendOwnAdress').is(':checked');
		var receiveCopy = template.$('#receiveCopy').is(':checked');

		if (message.length < '2') {
			alert(mf('profile.mail.longertext', 'longer text please'));
			return;
		}

		template.busy('sending');
		Meteor.call(
			'sendEmail',
			this.user._id,
			message,
			revealAddress,
			receiveCopy,
			function(error, result) {
				template.busy(false);
				if (error) {
					Alert.error(error, '');
				} else {
					Alert.success(mf('profile.mail.sent', 'Your message was sent'));
					template.$('#emailmessage').val('');
				}
			}
		);
	}
});

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import Roles from '/imports/api/roles/roles';

import PleaseLogin from '/imports/ui/lib/please-login';
import Alert from '/imports/api/alerts/alert';
import { HasRoleUser } from '/imports/utils/course-role-utils';

import '/imports/ui/components/profiles/course-list/profile-course-list';
import '/imports/ui/components/profiles/verify-email/verify-email';

import './userprofile.html';

Template.userprofile.helpers({
	// whether userprofile is for the logged-in user
	ownuser() {
		return this.user && this.user._id === Meteor.userId();
	},

	acceptsMessages() {
		return this.user
			&& this.user.acceptsMessages;
	},

	groupMember(group, user) {
		return user && group && group.members && group.members.indexOf(user._id) >= 0;
	},

	showInviteGroups() {
		return this.inviteGroups.count && this.inviteGroups.count() > 0;
	},

	showSettings() {
		const { showPrivileges } = Template.instance().data;
		const showInviteGroups = this.inviteGroups.count && this.inviteGroups.count() > 0;
		return showPrivileges || showInviteGroups;
	},
	roles() {
		return _.clone(Roles).reverse();
	},
	coursesByRole(role) {
		const templateData = Template.instance().data;
		const { involvedIn } = templateData;
		const userID = templateData.user._id;
		const coursesForRole = [];

		involvedIn.forEach((course) => {
			if (HasRoleUser(course.members, role, userID)) {
				coursesForRole.push(course);
			}
		});
		return coursesForRole;
	},
	roleUserList() {
		return `roles.${this.type}.userList`;
	},
	getName() {
		return Template.instance().data.user.username;
	},
});


Template.userprofile.events({
	'click button.giveAdmin': function () {
		Meteor.call('user.addPrivilege', this.user._id, 'admin', (err) => {
			if (err) {
				Alert.error(err, 'Unable to add privilege');
			} else {
				Alert.success(mf('privilege.addedAdmin', 'Granted admin privilege'));
			}
		});
	},

	'click .js-remove-privilege-btn': function (event, template) {
		const priv = template.$(event.target).data('priv');
		Meteor.call('user.removePrivilege', this.user._id, priv, (err) => {
			if (err) {
				Alert.error(err, 'Unable to remove privilege');
			} else {
				Alert.success(mf('privilege.removed', 'Removed privilege'));
			}
		});
	},

	'click button.draftIntoGroup': function () {
		const groupId = this._id;
		const { name } = this;
		const userId = Template.parentData().user._id;
		Meteor.call('group.updateMembership', userId, groupId, true, (err) => {
			if (err) {
				Alert.error(err, 'Unable to draft user into group');
			} else {
				Alert.success(mf('profile.group.drafted', { NAME: name }, 'Added to group {NAME}'));
			}
		});
	},

	'click .js-group-expel-btn': function () {
		Tooltips.hide();
		const groupId = this._id;
		const { name } = this;
		const userId = Template.parentData().user._id;
		Meteor.call('group.updateMembership', userId, groupId, false, (err) => {
			if (err) {
				Alert.error(err, 'Unable to expel user from group');
			} else {
				Alert.success(mf('profile.group.expelled', { NAME: name }, 'Expelled from group {NAME}'));
			}
		});
	},
});

Template.emailBox.onCreated(function () {
	this.verificationMailSent = new ReactiveVar(false);
	this.busy(false);
});

Template.emailBox.onRendered(function emailBoxOnRendered() {
	this.$('#emailmessage').select();
});

Template.emailBox.helpers({
	hasEmail() {
		const user = Meteor.user();
		if (!user) return false;

		const { emails } = user;
		return emails && emails[0];
	},

	hasVerifiedEmail() {
		return Meteor.user().emails[0].verified;
	},

	verificationMailSent() {
		return Template.instance().verificationMailSent.get();
	},
});

Template.emailBox.events({
	'click .js-verify-mail': function (e, instance) {
		instance.verificationMailSent.set(true);
		Meteor.call('sendVerificationEmail', (err) => {
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

		const recUserId = this.user._id;
		let recUser = Meteor.users.findOne({ _id: recUserId });
		if (recUser) {
			if (recUser.username) {
				recUser = recUser.username;
			}
		}

		const message = template.$('#emailmessage').val();
		const revealAddress = template.$('#sendOwnAdress').is(':checked');
		const receiveCopy = template.$('#receiveCopy').is(':checked');

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
			(error) => {
				template.busy(false);
				if (error) {
					Alert.error(error, '');
				} else {
					Alert.success(mf('profile.mail.sent', 'Your message was sent'));
					template.$('#emailmessage').val('');
				}
			},
		);
	},
});

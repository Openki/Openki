import { Tooltips } from 'meteor/lookback:tooltips';
import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { mf } from 'meteor/msgfmt:core';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import * as Alert from '/imports/api/alerts/alert';
import { Courses } from '/imports/api/courses/courses';
import { Users } from '/imports/api/users/users';

import { PleaseLogin } from '/imports/ui/lib/please-login';

import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

import '/imports/ui/components/profiles/course-list/profile-course-list';
import '/imports/ui/components/profiles/verify-email/verify-email';
import '/imports/ui/components/avatar/avatar';

import './userprofile.html';

Template.userprofile.onCreated(function () {
	this.busy(false);
	const userId = Template.instance().data.user._id;

	this.verifyUserDelete = new ReactiveVar(false);

	this.courseSub = this.subscribe('Courses.findFilter', { createdby: userId });
	this.coursesCreatedBy = function () {
		return Courses.find({ createdby: userId }).fetch();
	};
});

Template.userprofile.helpers({
	/**
	 * whether userprofile is for the logged-in user
	 */
	ownuser() {
		return this.user?._id === Meteor.userId();
	},

	acceptsPrivateMessages() {
		return this.user?.acceptsPrivateMessages || UserPrivilegeUtils.privilegedTo('admin');
	},

	groupMember(group, user) {
		return user && group?.members?.indexOf(user._id) >= 0;
	},

	showInviteGroups() {
		return this.inviteGroups.count && this.inviteGroups.count() > 0;
	},

	showSettings() {
		const { showPrivileges } = Template.instance().data;
		const showInviteGroups = this.inviteGroups.count && this.inviteGroups.count() > 0;
		return showPrivileges || showInviteGroups;
	},
	verifyUserDelete() {
		return Template.instance().verifyUserDelete.get();
	},
	numberOfCoursesAffectedByDelete() {
		return Template.instance().coursesCreatedBy().length;
	},
	numberOfInterestedAffectedByDelete() {
		return Template.instance().coursesCreatedBy()
			.reduce((accumulator, currentValue) => accumulator + currentValue.interested, 0);
	},
	numberOfFutureEventsAffectedByDelete() {
		return Template.instance().coursesCreatedBy()
			.reduce((accumulator, currentValue) => accumulator + currentValue.futureEvents, 0);
	},

	userId() {
		return this.user?._id || false;
	},
});


Template.userprofile.events({
	'click button.giveAdmin'() {
		Meteor.call('user.addPrivilege', this.user._id, 'admin', (err) => {
			if (err) {
				Alert.serverError(err, 'Unable to add privilege');
			} else {
				Alert.success(mf('privilege.addedAdmin', 'Granted admin privilege'));
			}
		});
	},

	'click .js-remove-privilege-btn'(event, template) {
		const priv = template.$(event.target).data('priv');
		Meteor.call('user.removePrivilege', this.user._id, priv, (err) => {
			if (err) {
				Alert.serverError(err, 'Unable to remove privilege');
			} else {
				Alert.success(mf('privilege.removed', 'Removed privilege'));
			}
		});
	},

	'click button.draftIntoGroup'() {
		const groupId = this._id;
		const { name } = this;
		const userId = Template.parentData().user._id;
		Meteor.call('group.updateMembership', userId, groupId, true, (err) => {
			if (err) {
				Alert.serverError(err, 'Unable to draft user into group');
			} else {
				Alert.success(mf('profile.group.drafted', { NAME: name }, 'Added to group {NAME}'));
			}
		});
	},

	'click .js-group-expel-btn'() {
		Tooltips.hide();
		const groupId = this._id;
		const { name } = this;
		const userId = Template.parentData().user._id;
		Meteor.call('group.updateMembership', userId, groupId, false, (err) => {
			if (err) {
				Alert.serverError(err, 'Unable to expel user from group');
			} else {
				Alert.success(mf('profile.group.expelled', { NAME: name }, 'Expelled from group {NAME}'));
			}
		});
	},

	'click .js-verify-user-delete-collapse'() {
		const instance = Template.instance();
		instance.verifyUserDelete.set(!instance.verifyUserDelete.get());
	},

	'click .js-verify-user-delete-confirm'(event, instance) {
		if (PleaseLogin()) {
			return;
		}

		instance.busy('deleting');

		const reason = instance.$('.js-reason').val();

		if (reason.length < 4) {
			Alert.error(mf('profile.admin.remove.reason.longertext', 'longer text please'));
			instance.busy(false);
			return;
		}

		const userId = Template.parentData().user._id;
		Meteor.call('user.admin.remove', userId, reason, { courses: true }, () => {
			instance.busy(false);
			Alert.success(mf('profile.account.deleted', 'The account has been deleted'));
			Router.go('users');
		});
	},
});

Template.emailBox.onCreated(function () {
	this.busy(false);
});

Template.emailBox.onRendered(function () {
	this.$('#emailmessage').select();
});

Template.emailBox.helpers({
	hasEmail() {
		return Meteor.user()?.hasEmail() || false;
	},

	hasVerifiedEmail() {
		return Meteor.user()?.hasVerifiedEmail() || false;
	},
});

Template.emailBox.events({

	'change .js-send-own-adress'(event, instance) {
		instance.$('.js-send-own-adress + .checkmark').toggle();
	},

	'change .js-receive-copy'(event, instance) {
		instance.$('.js-receive-copy + .checkmark').toggle();
	},

	'submit form.sendMail'(event, template) {
		event.preventDefault();
		if (PleaseLogin()) {
			return;
		}

		const recUserId = this.user._id;
		let recUser = Users.findOne({ _id: recUserId });
		if (recUser) {
			if (recUser.username) {
				recUser = recUser.username;
			}
		}

		const message = template.$('#emailmessage').val();
		const revealAddress = template.$('#sendOwnAdress').is(':checked');
		const receiveCopy = template.$('#receiveCopy').is(':checked');

		if (message.length < '2') {
			Alert.serverError(mf('profile.mail.longertext', 'longer text please'));
			return;
		}

		template.busy('sending');
		Meteor.call(
			'sendEmail',
			this.user._id,
			message,
			revealAddress,
			receiveCopy,
			(err) => {
				template.busy(false);
				if (err) {
					Alert.serverError(err, '');
				} else {
					Alert.success(mf('profile.mail.sent', 'Your message was sent'));
					template.$('#emailmessage').val('');
				}
			},
		);
	},
});

import { Tooltips } from 'meteor/lookback:tooltips';
import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { mf } from 'meteor/msgfmt:core';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import * as Alert from '/imports/api/alerts/alert';
import { Courses } from '/imports/api/courses/courses';
import * as GroupsMethods from '/imports/api/groups/methods';

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
		return !!(user && group?.members?.includes(user._id));
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
		return Template.instance()
			.coursesCreatedBy()
			.reduce((accumulator, currentValue) => accumulator + currentValue.interested, 0);
	},
	numberOfFutureEventsAffectedByDelete() {
		return Template.instance()
			.coursesCreatedBy()
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

	async 'click button.draftIntoGroup'() {
		const groupId = this._id;
		const { name } = this;
		const userId = Template.parentData().user._id;

		try {
			await GroupsMethods.updateMembership(userId, groupId, true);

			Alert.success(mf('profile.group.drafted', { NAME: name }, 'Added to group {NAME}'));
		} catch (err) {
			Alert.serverError(err, 'Unable to draft user into group');
		}
	},

	async 'click .js-group-expel-btn'() {
		Tooltips.hide();
		const groupId = this._id;
		const { name } = this;
		const userId = Template.parentData().user._id;

		try {
			await GroupsMethods.updateMembership(userId, groupId, false);

			Alert.success(mf('profile.group.expelled', { NAME: name }, 'Expelled from group {NAME}'));
		} catch (err) {
			Alert.serverError(err, 'Unable to expel user from group');
		}
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

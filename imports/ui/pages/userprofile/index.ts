import { Tooltips } from 'meteor/lookback:tooltips';
import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { i18n } from '/imports/startup/both/i18next';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import * as Alert from '/imports/api/alerts/alert';
import { CourseModel, Courses } from '/imports/api/courses/courses';
import { GroupEntity } from '/imports/api/groups/groups';
import * as GroupsMethods from '/imports/api/groups/methods';
import { UserModel } from '/imports/api/users/users';
import * as usersMethods from '/imports/api/users/methods';

import { PleaseLogin } from '/imports/ui/lib/please-login';

import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import { checkContribution } from '/imports/utils/checkContribution';

import '/imports/ui/components/profiles/course-list';
import '/imports/ui/components/profiles/verify-email';
import '/imports/ui/components/avatar';
import '/imports/ui/components/send-message';

import './template.html';

interface UserProfilePageData {
	user: UserModel;
	alterPrivileges: boolean;
	privileges: string[];
	inviteGroups: Mongo.Cursor<GroupEntity>;
	showPrivileges: boolean;
}

const Template = TemplateAny as TemplateStaticTyped<
	'userprofilePage',
	UserProfilePageData,
	{ state: ReactiveDict<{ verifyUserDelete: boolean }>; coursesCreatedBy(): CourseModel[] }
>;

const template = Template.userprofilePage;

template.onCreated(function () {
	const instance = this;
	instance.busy(false);
	const userId = instance.data.user._id;

	instance.state = new ReactiveDict(undefined, { verifyUserDelete: false });

	instance.subscribe('Courses.findFilter', { createdby: userId });
	instance.coursesCreatedBy = () => {
		return Courses.find({ createdby: userId }).fetch();
	};
});

template.helpers({
	/**
	 * whether userprofile is for the logged-in user
	 */
	ownuser() {
		return Template.instance().data.user._id === Meteor.userId();
	},

	hasContributed() {
		return checkContribution(Template.instance().data.user.contribution);
	},

	acceptsPrivateMessages() {
		return (
			Template.instance().data.user.acceptsPrivateMessages ||
			UserPrivilegeUtils.privilegedTo('admin')
		);
	},

	groupMember(group: GroupEntity, user: UserModel) {
		return !!(user && group?.members?.includes(user._id));
	},

	showInviteGroups() {
		const { data } = Template.instance();

		if (data.user._id === Meteor.userId()) {
			return false;
		}
		return data.inviteGroups?.count && data.inviteGroups.count() > 0;
	},

	showSettings() {
		const { data } = Template.instance();

		if (data.showPrivileges) {
			return true;
		}

		if (data.user._id === Meteor.userId()) {
			return false;
		}

		return data.inviteGroups?.count && data.inviteGroups.count() > 0;
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
});

template.events({
	async 'click .js-has-contributed'(_event, instance) {
		const { data } = instance;
		try {
			await usersMethods.setHasContributed(data.user._id);

			Alert.success(i18n('profile.setHasContributed.alert', 'User has contributed'));
		} catch (err) {
			Alert.serverError(
				err,
				i18n('profile.setHasContributed.error', 'Unable to set user has contributed.'),
			);
		}
	},

	async 'click .js-unset-has-contributed'(_event, instance) {
		const { data } = instance;
		try {
			await usersMethods.unsetHasContributed(data.user._id);

			Alert.success(i18n('profile.unsetHasContributed.alert', 'Unset user has contributed'));
		} catch (err) {
			Alert.serverError(
				err,
				i18n('profile.unsetHasContributed.error', 'Unable to unset user has contributed.'),
			);
		}
	},

	async 'click .js-give-admin'(_event, instance) {
		const { data } = instance;
		try {
			await usersMethods.addPrivilege(data.user._id, 'admin');

			Alert.success(i18n('privilege.addedAdmin', 'Granted admin privilege'));
		} catch (err) {
			Alert.serverError(err, i18n('privilege.addedAdmin.error', 'Unable to add privilege'));
		}
	},

	async 'click .js-remove-privilege-btn'(event, instance) {
		const { data } = instance;
		const priv = instance.$(event.target as any).data('priv');
		try {
			await usersMethods.removePrivilege(data.user._id, priv);

			Alert.success(i18n('privilege.removed', 'Removed privilege'));
		} catch (err) {
			Alert.serverError(err, i18n('privilege.removed.error', 'Unable to remove privilege'));
		}
	},

	async 'click .js-draft-into-group'(this: GroupEntity, _event, instance) {
		const { _id: groupId, name } = this;
		const { data } = instance;
		const userId = data.user._id;

		try {
			await GroupsMethods.updateMembership(userId, groupId, true);

			Alert.success(i18n('profile.group.drafted', 'Added to group {NAME}', { NAME: name }));
		} catch (err) {
			Alert.serverError(
				err,
				i18n('profile.group.drafted.error', 'Unable to draft user into group'),
			);
		}
	},

	async 'click .js-group-expel-btn'(this: GroupEntity, _event, instance) {
		Tooltips.hide();
		const { _id: groupId, name } = this;
		const { data } = instance;
		const userId = data.user._id;

		try {
			await GroupsMethods.updateMembership(userId, groupId, false);

			Alert.success(i18n('profile.group.expelled', 'Expelled from group {NAME}', { NAME: name }));
		} catch (err) {
			Alert.serverError(
				err,
				i18n('profile.group.expelled.error', 'Unable to expel user from group'),
			);
		}
	},

	'click .js-verify-user-delete-collapse'() {
		const instance = Template.instance();
		instance.state.set('verifyUserDelete', !instance.state.get('verifyUserDelete'));
	},

	'click .js-verify-user-delete-confirm'(_event, instance) {
		if (PleaseLogin()) {
			return;
		}

		instance.busy('deleting');

		const reason = instance.$('.js-reason').val() as string;

		if (reason.length < 4) {
			Alert.error(i18n('profile.admin.remove.reason.longertext', 'longer text please'));
			instance.busy(false);
			return;
		}

		const userId = instance.data.user._id;

		try {
			Alert.success(i18n('profile.account.deleted', 'The account has been deleted'));
			Router.go('users');
		} finally {
			instance.busy(false);
		}
		usersMethods.adminRemove(userId, reason, { courses: true });
	},
});

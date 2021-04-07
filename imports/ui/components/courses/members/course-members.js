import { Meteor } from 'meteor/meteor';
import { mf } from 'meteor/msgfmt:core';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import { Alert } from '/imports/api/alerts/alert';
import Roles from '/imports/api/roles/roles';
import {
	Subscribe, Unsubscribe, Message, processChange,
} from '/imports/api/courses/subscription';
import { Users } from '/imports/api/users/users';

import Editable from '/imports/ui/lib/editable';
import { HasRoleUser } from '/imports/utils/course-role-utils';
import UserPrivilegeUtils from '/imports/utils/user-privilege-utils';


import '/imports/ui/components/editable/editable';
import '/imports/ui/components/participant/contact/participant-contact';
import '/imports/ui/components/profile-link/profile-link';
import '/imports/ui/components/send-message/send-message';

import './course-members.html';

Template.courseMembers.onCreated(function () {
	this.increaseBy = 10;
	this.membersDisplayLimit = new ReactiveVar(this.increaseBy);
});

Template.courseMembers.helpers({
	howManyEnrolled() {
		return this.members.length;
	},

	canNotifyAll() {
		const userId = Meteor.userId();
		return userId && HasRoleUser(this.members, 'team', userId);
	},

	ownUserMember() {
		return this.members.find((member) => member.user === Meteor.userId());
	},

	sortedMembers() {
		const { members } = this;
		members.sort((a, b) => {
			const aRoles = a.roles.filter((role) => role !== 'participant');
			const bRoles = b.roles.filter((role) => role !== 'participant');
			return bRoles.length - aRoles.length;
		});
		// check if logged-in user is in members and if so put him on top
		const userId = Meteor.userId();
		if (userId && members.some((member) => member.user === userId)) {
			const userArrayPosition = members.findIndex((member) => member.user === userId);
			const currentMember = members[userArrayPosition];
			// remove current user form array and readd him at index 0
			members.splice(userArrayPosition, 1); // remove
			members.splice(0, 0, currentMember); // readd
		}
		return (
			members.slice(0, Template.instance().membersDisplayLimit.get())
		);
	},

	limited() {
		const membersDisplayLimit = Template.instance().membersDisplayLimit.get();
		return membersDisplayLimit && this.members.length > membersDisplayLimit;
	},
});

Template.courseMembers.events({
	'click .js-contact-members'() {
		$('.course-page-btn.js-discussion-edit').trigger('notifyAll');
	},

	'click .js-show-more-members'(e, instance) {
		const { membersDisplayLimit } = instance;
		membersDisplayLimit.set(membersDisplayLimit.get() + instance.increaseBy);
	},
});

Template.courseMember.onCreated(function () {
	const instance = this;
	instance.subscribe('user', this.data.member.user);

	instance.editableMessage = new Editable(
		true,
		mf('roles.message.placeholder', 'My interests...'),
		(newMessage) => {
			const change = new Message(instance.data.course, Meteor.user(), newMessage);
			processChange(change, () => {
				Alert.success(mf('courseMember.messageChanged', 'Your enroll-message has been changed.'));
			});
		},
	);

	instance.autorun(() => {
		const data = Template.currentData();
		instance.editableMessage.setText(data.member.comment);
	});

	instance.subscribeToTeam = function () {
		const user = Users.findOne(this.data.member.user);
		if (!user) return undefined; // Probably not loaded yet

		return new Subscribe(this.data.course, user, 'team');
	};

	instance.removeFromTeam = function () {
		const user = Users.findOne(this.data.member.user);
		if (!user) return undefined; // Probably not loaded yet

		return new Unsubscribe(this.data.course, user, 'team');
	};
});


Template.courseMember.helpers({
	ownUserMemberClass() {
		if (this.member.user === Meteor.userId()) {
			return 'is-own-user';
		}
		return '';
	},

	memberRoles() {
		return this.member.roles.filter((role) => role !== 'participant');
	},

	roleShort() { return `roles.${this}.short`; },

	maySubscribeToTeam() {
		const change = Template.instance().subscribeToTeam();
		return change?.validFor(Meteor.user());
	},

	/**
	 * @param {string} roletype
	 */
	rolelistIcon(roletype) {
		if (roletype !== 'participant') {
			return Roles.find((role) => role.type === roletype)?.icon || '';
		}
		return '';
	},

	editableMessage() {
		const mayChangeComment = this.member.user === Meteor.userId();
		return mayChangeComment && Template.instance().editableMessage;
	},

	/**
	 * @param {string} label
	 */
	mayUnsubscribeFromTeam(label) {
		if (label !== 'team') {
			return false;
		}
		const change = Template.instance().removeFromTeam();
		return change && change.validFor(Meteor.user());
	},

	showMemberComment() {
		const mayChangeComment = this.member.user === Meteor.userId();
		return this.member.comment || mayChangeComment;
	},
});

Template.removeFromTeamDropdown.helpers({
	isNotPriviledgedSelf() {
		const notPriviledgedUser = !UserPrivilegeUtils.privilegedTo('admin');
		return this.member.user === Meteor.userId() && notPriviledgedUser;
	},
});

Template.courseMember.events({
	'click .js-add-to-team-btn'(event, instance) {
		event.preventDefault();
		processChange(instance.subscribeToTeam());
	},
	'click .js-remove-team'(event, instance) {
		event.preventDefault();
		processChange(instance.removeFromTeam());
	},
});

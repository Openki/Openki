import { Meteor } from 'meteor/meteor';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import Roles from '/imports/api/roles/roles.js';
import { Subscribe, Unsubscribe } from '/imports/api/courses/subscription.js';

import Editable from '/imports/ui/lib/editable.js';
import Alert from '/imports/api/alerts/alert.js';
import { HasRoleUser } from '/imports/utils/course-role-utils.js';
import UserPrivilegeUtils from '/imports/utils/user-privilege-utils.js';

import { Message, processChange } from '/imports/api/courses/subscription.js';

import '/imports/ui/components/editable/editable.js';
import '/imports/ui/components/profile-link/profile-link.js';
import '/imports/ui/components/send-message/send-message.js';

import './course-members.html';

Template.courseMembers.onCreated(function() {
	this.increaseBy = 10;
	this.membersLimit = new ReactiveVar(this.increaseBy);
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
		return (
			this.members
			// remove own user if logged in and course member (it then already
			// appears on top)
			.filter((member) => member.user !== Meteor.userId())
			// sort by amount of roles, not counting 'participant' role
			.sort((a, b) => {
				const aRoles = a.roles.filter((role) => role !== 'participant');
				const bRoles = b.roles.filter((role) => role !== 'participant');

				return bRoles.length - aRoles.length;
			})
			// apply limit
			.slice(0, Template.instance().membersLimit.get())
		);
	},

	limited() {
		const membersLimit = Template.instance().membersLimit.get();
		return membersLimit && this.members.length > membersLimit;
	}
});

Template.courseMembers.events({
	'click #contactMembers'() {
		$('.course-page-btn.js-discussion-edit').trigger('notifyAll');
	},

	'click .js-show-all-members'(e, instance) {
		var membersLimit = instance.membersLimit;

		membersLimit.set(membersLimit.get() + instance.increaseBy);
	}
});

Template.courseMember.onCreated(function() {
	const instance = this;
	instance.subscribe('user', this.data.member.user);

	this.state = new ReactiveDict();
	this.state.setDefault(
		{ showContactModal: false }
	);

	instance.userSub = Meteor.subscribe('user', this.data.member.user);

	instance.editableMessage = new Editable(
		true,
		function(newMessage) {
			const change = new Message(instance.data.course, Meteor.user(), newMessage);
			processChange(change, () => {
				Alert.success(mf('courseMember.messageChanged', 'Your enroll-message has been changed.'));
			});
		},
		mf('roles.message.placeholder', 'My interests...')
	);

	instance.autorun(function() {
		const data = Template.currentData();
		instance.editableMessage.setText(data.member.comment);
	});

	instance.subscribeToTeam = function() {
		const user = Users.findOne(this.data.member.user);
		if (!user) return false; // Probably not loaded yet

		return new Subscribe(this.data.course, user, 'team');
	};

	instance.removeFromTeam = function() {
		const user = Users.findOne(this.data.member.user);
		if (!user) return false; // Probably not loaded yet

		return new Unsubscribe(this.data.course, user, 'team');
	};
});

Template.courseMember.helpers({
	ownUserMemberClass() {
		if (this.isOwnUserMember) return 'is-own-user';
    },

	memberRoles() {
		return this.member.roles.filter(role => role !== 'participant');
	},

	memberAcceptsMessages() {
		const user = Meteor.users.findOne(this.member.user);
		return user && user.acceptsMessages;
	},

	userSubReady() {
		return Template.instance().userSub.ready();
	},

	roleShort() { return 'roles.'+this+'.short'; },

	maySubscribeToTeam: function() {
		const change = Template.instance().subscribeToTeam();
		return change && change.validFor(Meteor.user());
	},

	rolelistIcon(roletype) {
		if (roletype != "participant") {
			return Roles.find((role) => role.type === roletype).icon;
		}
	},

	editableMessage() {
		const mayChangeComment = this.member.user === Meteor.userId();
		return mayChangeComment && Template.instance().editableMessage;
	},

	mayUnsubscribeFromTeam(label) {
		if (label != 'team') return false;
		const change = Template.instance().removeFromTeam();
		return change && change.validFor(Meteor.user());
	},

	showMemberComment() {
		const mayChangeComment = this.member.user === Meteor.userId();
		return this.member.comment || mayChangeComment;
	},

	showContactMember() {
		const userId = Meteor.userId();
		if (!userId) return false;

		return userId !== this.member.user;
	}
});

Template.removeFromTeamDropdown.helpers({
	isNotPriviledgedSelf() {
		const notPriviledgedUser = !UserPrivilegeUtils.privileged(Meteor.userId(), 'admin');
		return (this.member.user === Meteor.userId() && notPriviledgedUser);
	}
});

Template.courseMember.events({
	'click .js-add-to-team-btn': function(event, instance) {
		event.preventDefault();
		processChange(instance.subscribeToTeam());
	},
	'click .js-remove-team': function(event, instance) {
		event.preventDefault();
		processChange(instance.removeFromTeam());
	},

	'click .js-show-contact-modal'(event, instance) {
		instance.state.set('showContactModal', true);
	},

	'hidden.bs.modal .js-contact-participant'(event, instance) {
		instance.state.set('showContactModal', false);
	}
});

Template.contactParticipantModal.onCreated(function() {
	this.state = new ReactiveDict();
	this.state.setDefault(
		{ messageSent: false }
	);

	this.autorun(() => {
		if (this.state.get('messageSent')) this.$('.js-contact-participant').modal('hide');
	});
});

Template.contactParticipantModal.onRendered(function() {
	this.$('.js-contact-participant').modal('show');
});

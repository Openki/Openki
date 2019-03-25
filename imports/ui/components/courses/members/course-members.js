import { Meteor } from 'meteor/meteor';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import Roles from '/imports/api/roles/roles.js';

import Editable from '/imports/ui/lib/editable.js';
import Alert from '/imports/api/alerts/alert.js';
import {
	HasRoleUser,
	MaySubscribe,
	MayUnsubscribe
} from '/imports/utils/course-role-utils.js';
import UserPrivilegeUtils from '/imports/utils/user-privilege-utils.js';

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
	const courseId = this.data.course._id;

	this.state = new ReactiveDict();
	this.state.setDefault(
		{ showContactModal: false }
	);

	instance.userSub = Meteor.subscribe('user', this.data.member.user);

	instance.editableMessage = new Editable(
		true,
		function(newMessage) {
			Meteor.call("course.changeComment", courseId, newMessage, function(err, courseId) {
				if (err) {
					Alert.error(err, 'Unable to change your message');
				} else {
					Alert.success(mf('courseMember.messageChanged', 'Your enroll-message has been changed.'));
				}
			});
		},
		mf('roles.message.placeholder', 'My interests...')
	);

	instance.autorun(function() {
		const data = Template.currentData();
		instance.editableMessage.setText(data.member.comment);
	});
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

	maySubscribe() {
		return MaySubscribe(Meteor.userId(), this.course, this.member.user, 'team');
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
		return label == 'team'
			&& MayUnsubscribe(Meteor.userId(), this.course, this.member.user, 'team');
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
	'click .js-add-to-team-btn'(event, instance) {
		Meteor.call("course.addRole", this.course._id, this.member.user, 'team', false);
		return false;
	},
	'click .js-remove-team'(event, instance) {
		Meteor.call("course.removeRole", this.course._id, this.member.user, 'team');
		return false;
	},

	'click .js-show-contact-modal'(event, instance) {
		instance.state.set('showContactModal', true);
	},

	'hidden.bs.modal .js-contact-member'(event, instance) {
		instance.state.set('showContactModal', false);
	}
});

Template.contactMemberModal.onCreated(function() {
	this.state = new ReactiveDict();
	this.state.setDefault(
		{ messageSent: false }
	);

	this.autorun(() => {
		if (this.state.get('messageSent')) this.$('.js-contact-member').modal('hide');
	});
});

Template.contactMemberModal.onRendered(function() {
	this.$('.js-contact-member').modal('show');
});

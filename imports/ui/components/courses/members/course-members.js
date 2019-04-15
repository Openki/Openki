import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import Alert from '/imports/api/alerts/alert.js';
import Roles from '/imports/api/roles/roles.js';

import Editable from '/imports/ui/lib/editable.js';

import {
	HasRoleUser,
	MaySubscribe,
	MayUnsubscribe
} from '/imports/utils/course-role-utils.js';
import UserPrivilegeUtils from '/imports/utils/user-privilege-utils.js';

import '/imports/ui/components/editable/editable.js';
import '/imports/ui/components/participant/contact/participant-contact.js';
import '/imports/ui/components/profile-link/profile-link.js';
import '/imports/ui/components/send-message/send-message.js';

import './course-members.html';

Template.courseMembers.onCreated(function() {
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
		let members = this.members;
		members.sort((a, b) => {
			const aRoles = a.roles.filter((role) => role !== 'participant');
			const bRoles = b.roles.filter((role) => role !== 'participant');
			return bRoles.length - aRoles.length;
		});
		//check if logged-in user is in members and if so put him on top
		const userId = Meteor.userId();
		if (userId && members.some(member => member.user === userId)) {
			const userArrayPosition = members.findIndex((member) => member.user === userId);
			const currentMember = members[userArrayPosition];
			//remove current user form array and readd him at index 0
			members.splice(userArrayPosition, 1); //remove
			members.splice(0, 0, currentMember); //readd
		}
		return (
			members.slice(0, Template.instance().membersDisplayLimit.get())
		);
	},

	limited() {
		const membersDisplayLimit = Template.instance().membersDisplayLimit.get();
		return membersDisplayLimit && this.members.length > membersDisplayLimit;
	}
});

Template.courseMembers.events({
	'click .js-contact-members'() {
		$('.course-page-btn.js-discussion-edit').trigger('notifyAll');
	},

	'click .js-show-more-members': function(e, instance) {
		const membersDisplayLimit = instance.membersDisplayLimit;
		membersDisplayLimit.set(membersDisplayLimit.get() + instance.increaseBy);
	}
});

Template.courseMember.onCreated(function() {
	const instance = this;
	const courseId = this.data.course._id;

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
		if (Template.instance().data.member.user == Meteor.userId()) return 'is-own-user';
    },

	memberRoles() {
		return this.member.roles.filter(role => role !== 'participant');
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
});


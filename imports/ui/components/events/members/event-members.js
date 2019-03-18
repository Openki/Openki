import { Meteor } from 'meteor/meteor';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import Alert from '/imports/api/alerts/alert.js';
import UserPrivilegeUtils from '/imports/utils/user-privilege-utils.js';

import '/imports/ui/components/profile-link/profile-link.js';

import './event-members.html';

Template.eventMembers.onCreated(function() {
	this.increaseBy = 10;
	this.membersLimit = new ReactiveVar(this.increaseBy);
});

Template.eventMembers.helpers({
	howManyEnrolled() {
		return this.members.length;
	},

	sortedMembers() {
		return (
			this.members
			// remove own user if logged in and course member (it then already
			// appears on top)
			.filter((member) => member !== Meteor.userId())
		);
	},

	ownUserMember() {
		return this.members.find((member) => member === Meteor.userId());
	},

});

Template.eventMembers.events({
});

Template.eventMember.onCreated(function() {
	const instance = this;
	const eventId = this.data.event._id;

	this.state = new ReactiveDict();
	this.state.setDefault(
		{ showContactModal: false }
	);

});

Template.eventMember.helpers({
	ownUserMemberClass() {
		if (this.isOwnUserMember) return 'is-own-user';
	},
});


Template.eventMember.events({
});

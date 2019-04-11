import { Meteor } from 'meteor/meteor';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import Alert from '/imports/api/alerts/alert.js';
import UserPrivilegeUtils from '/imports/utils/user-privilege-utils.js';

import '/imports/ui/components/profile-link/profile-link.js';

import './event-participants.html';

Template.eventParticipants.onCreated(function() {
	this.increaseBy = 10;
	this.participantsShowLimit = new ReactiveVar(this.increaseBy);
});

Template.eventParticipants.helpers({
	howManyEnrolled() {
		return (this.participants && this.participants.length) || 0;
	},

	sortedParticipants() {
		//check if logged-in user is in participants and if so put him on top (if not already)
		const userId = Meteor.userId();
		if (userId && this.participants.includes(userId)) {
			if (this.participants[0] === userId) {
				//is already on top
				return this.participants;
			} else {
				const userArrayPosition = this.participants.indexOf(userId);
				//remove current user form array and readd him at index 0
				this.participants.splice(userArrayPosition, 1); //remove
				this.participants.splice(0, 0, userId); //readd
			}
		}
		return this.participants;
	},

});

Template.eventParticipant.onCreated(function() {
	const instance = this;
	const eventId = this.data.event._id;
	const participant = this.data.participant;

	instance.userSub = Meteor.subscribe('user', participant);
	instance.isOwnUserParticipant = participant === Meteor.userId();

	this.state = new ReactiveDict();
	this.state.setDefault(
		{ showContactEventParticipantModal: false }
	);

});

Template.eventParticipant.helpers({
	ownUserParticipantClass() {
		if (Template.instance().isOwnUserParticipant) return 'is-own-user';
	},

	showContactParticipant() {
		const userId = Meteor.userId();
		if (!userId) return false;

		return userId !== this.participant;
	},

	userSubReady() {
		return Template.instance().userSub.ready();
	},

	userAcceptsMessages() {
		const user = Meteor.users.findOne(this.participant);
		return user && user.acceptsMessages;
	},

});

Template.eventParticipant.events({
	'click .js-show-contact-modal'(event, instance) {
		instance.state.set('showContactEventParticipantModal', true);
	},

	'hidden.bs.modal .js-contact-event-participant-modal'(event, instance) {
		instance.state.set('showContactEventParticipantModal', false);
	}
});

Template.contactEventParticipantModal.onCreated(function() {
	this.state = new ReactiveDict();
	this.state.setDefault(
		{ messageSent: false }
	);

	this.autorun(() => {
		if (this.state.get('messageSent')) this.$('.js-contact-event-participant-modal').modal('hide');
	});
});

Template.contactEventParticipantModal.onRendered(function() {
	this.$('.js-contact-event-participant-modal').modal('show');
});

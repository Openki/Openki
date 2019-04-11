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
	this.participantsDisplayLimit = new ReactiveVar(this.increaseBy);
});

Template.eventParticipants.helpers({
	howManyEnrolled() {
		return (this.participants && this.participants.length) || 0;
	},

	sortedParticipants() {
		const participants = this.participants;
		//check if logged-in user is in participants and if so put him on top (if not already)
		const userId = Meteor.userId();
		if (userId && participants.includes(userId)) {
			if (participants[0] !== userId) {
				const userArrayPosition = participants.indexOf(userId);
				//remove current user form array and readd him at index 0
				participants.splice(userArrayPosition, 1); //remove
				participants.splice(0, 0, userId); //readd
			}
		}
		return participants.slice(0, Template.instance().participantsDisplayLimit.get());
	},

	limited() {
		const participantsDisplayLimit = Template.instance().participantsDisplayLimit.get();
		return participantsDisplayLimit && this.participants.length > participantsDisplayLimit;
	}

});

Template.eventParticipants.events({
	'click .js-show-more-participants': function(event, instance) {
		const participantsDisplayLimit = instance.participantsDisplayLimit;
		participantsDisplayLimit.set(participantsDisplayLimit.get() + instance.increaseBy);
	}
});

Template.eventParticipant.onCreated(function() {
	const instance = this;
	const eventId = this.data.event._id;

	instance.userSub = Meteor.subscribe('user', this.data.participant);

	this.state = new ReactiveDict();
	this.state.setDefault(
		{ showContactEventParticipantModal: false }
	);

});

Template.eventParticipant.helpers({
	ownUserParticipantClass() {
		if (Template.instance().data.participant == Meteor.userId()) return 'is-own-user';
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

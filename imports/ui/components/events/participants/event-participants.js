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
		return (
			this.participants
			// remove own user if logged in and participant (it then already
			// appears on top)
			.filter((participant) => participant !== Meteor.userId())
		);
	},

	ownUserParticipant() {
		return this.participants.find((participant) => participant === Meteor.userId());
	},

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
		if (this.isOwnUserParticipant) return 'is-own-user';
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

	'hidden.bs.modal .js-contact-participant-modal'(event, instance) {
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

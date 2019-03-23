import { Meteor } from 'meteor/meteor';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import Alert from '/imports/api/alerts/alert.js';
import UserPrivilegeUtils from '/imports/utils/user-privilege-utils.js';

import '/imports/ui/components/profile-link/profile-link.js';

import './participants.html';

Template.participants.onCreated(function() {
	this.increaseBy = 10;
	this.participantsShowLimit = new ReactiveVar(this.increaseBy);
});

Template.participants.helpers({
	howManyEnrolled() {
		return (this.participants && this.participants.length) || 0;
	},

	sortedParticipants() {
		return (
			this.participants
			// remove own user if logged in and participant (it then already
			// appears on top)
			.filter((participant) => participant.user !== Meteor.userId())
		);
	},

	ownUserParticipant() {
		return this.participants.find((participant) => participant.user === Meteor.userId());
	},

});

Template.participants.events({
});

Template.participant.onCreated(function() {
	const instance = this;
	const eventId = this.data.event._id;

	instance.userSub = Meteor.subscribe('user', this.data.participant.user);

	this.state = new ReactiveDict();
	this.state.setDefault(
		{ showContactModal: false }
	);

});

Template.participant.helpers({
	ownUserParticipantClass() {
		if (this.isOwnUserParticipant) return 'is-own-user';
	},

	showContactParticipant() {
		const userId = Meteor.userId();
		if (!userId) return false;

		return userId !== this.participant.user;
	},

	userSubReady() {
		return Template.instance().userSub.ready();
	},

	userAcceptsMessages() {
		const user = Meteor.users.findOne(this.participant.user);
		return user && user.acceptsMessages;
	},

});


Template.participant.events({
	'click .js-show-contact-modal'(event, instance) {
		instance.state.set('showContactModal', true);
	},

	'hidden.bs.modal .js-contact-participant'(event, instance) {
		instance.state.set('showContactModal', false);
	}
});

Template.participantContactModal.onCreated(function() {
	this.state = new ReactiveDict();
	this.state.setDefault(
		{ messageSent: false }
	);

	this.autorun(() => {
		if (this.state.get('messageSent')) this.$('.js-contact-participant').modal('hide');
	});
});

Template.participantContactModal.onRendered(function() {
	this.$('.js-contact-participant').modal('show');
});


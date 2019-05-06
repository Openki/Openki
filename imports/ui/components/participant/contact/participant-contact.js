import { ReactiveDict } from 'meteor/reactive-dict';

import './participant-contact.html';

Template.participantContact.onCreated(function() {
	this.state = new ReactiveDict();
	this.state.setDefault(
		{ showParticipantContactModal: false }
	);
	this.userSub = Meteor.subscribe('user', this.data.participant);
});

Template.participantContact.helpers({
	showParticipantContact() {
		const userId = Meteor.userId();
		if (!userId) return false;

		return userId !== this.participant;
	},

	userAcceptsMessages() {
		const user = Meteor.users.findOne(this.participant);
		return user && user.acceptsMessages;
	},

	userSubReady() {
		return Template.instance().userSub.ready();
	},
});

Template.participantContact.events({
	'click .js-show-participant-contact-modal'(event, instance) {
		instance.state.set('showParticipantContactModal', true);
	},

	'hidden.bs.modal .js-participant-contact-modal'(event, instance) {
		instance.state.set('showParticipantContactModal', false);
	}
});

Template.participantContactModal.onCreated(function() {
	this.state = new ReactiveDict();
	this.state.setDefault(
		{ messageSent: false }
	);

	this.autorun(() => {
		if (this.state.get('messageSent')) this.$('.js-participant-contact-modal').modal('hide');
	});
});

Template.participantContactModal.onRendered(function() {
	this.$('.js-participant-contact-modal').modal('show');
});

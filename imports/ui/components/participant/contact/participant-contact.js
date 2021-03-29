import { ReactiveDict } from 'meteor/reactive-dict';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Users } from '/imports/api/users/users';
/** @typedef {import('/imports/api/users/users').UserModel} UserModel */

import './participant-contact.html';

Template.participantContact.onCreated(function () {
	this.userSub = Meteor.subscribe('user', this.data.participant);

	this.state = new ReactiveDict();

	this.state.setDefault({
		showModal: false,
	});
});

Template.participantContact.onRendered(function () {
	this.autorun(() => {
		if (this.state.get('showModal')) {
			Meteor.defer(() => {
				this.$('.js-participant-contact-modal').modal('show');
			});
		}
	});
});

Template.participantContact.helpers({

	hideModal() {
		const instance = Template.instance();
		return () => {
			instance.$('.js-participant-contact-modal').modal('hide');
		};
	},

	showParticipantContact() {
		const userId = Meteor.userId();
		if (!userId) {
			return false;
		}

		return userId !== this.participant;
	},

	userAcceptsPrivateMessages() {
		const user = Users.findOne(this.participant);
		return user?.acceptsPrivateMessages;
	},

	userSubReady() {
		return Template.instance().userSub.ready();
	},
});

Template.participantContact.events({
	'click .js-show-participant-contact-modal'(event, instance) {
		instance.state.set('showModal', true);
	},

	'hidden.bs.modal .js-participant-contact-modal'(event, instance) {
		instance.state.set('showModal', false);
	},
});

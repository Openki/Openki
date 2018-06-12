import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import AlertMessages from '/imports/api/alert-messages/alert-messages.js';

import './verify-email.html';

Template.verifyEmail.onCreated(function() {
	this.sending = new ReactiveVar(false);
});

Template.verifyEmail.helpers({
	sending: function() {
		return Template.instance().sending.get();
	},
});

Template.verifyEmail.events({
	'click .js-verify-mail-btn': function(event, instance) {
		instance.sending.set(true);
		Meteor.call('sendVerificationEmail', function(err) {
			if (err) {
				instance.sending.set(false);
				AlertMessages.add('error', err, 'Failed to send verification mail');
			} else {
				AlertMessages.add('success', mf('profile.sentVerificationMail', 'A verification mail is on its way to your address.'));
			}
		});
	}
});

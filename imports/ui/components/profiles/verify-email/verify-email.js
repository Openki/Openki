import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { AddMessage } from '/imports/api/messages/methods.js';

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
				showServerError('Failed to send verification mail', err);
			} else {
				AddMessage(mf('profile.sentVerificationMail', 'A verification mail is on its way to your address.'), 'success');
			}
		});
	}
});

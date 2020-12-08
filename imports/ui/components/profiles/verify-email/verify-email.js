import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import Alert from '/imports/api/alerts/alert';

import './verify-email.html';

Template.verifyEmail.onCreated(function () {
	this.sending = new ReactiveVar(false);
});

Template.verifyEmail.helpers({
	sending() {
		return Template.instance().sending.get();
	},
});

Template.verifyEmail.events({
	'click .js-verify-mail-btn'(event, instance) {
		instance.sending.set(true);
		Meteor.call('sendVerificationEmail', err => {
			if (err) {
				instance.sending.set(false);
				Alert.serverError(err, 'Failed to send verification mail');
			} else {
				Alert.success(mf('profile.sentVerificationMail', 'A verification mail is on its way to your address.'));
			}
		});
	},
});

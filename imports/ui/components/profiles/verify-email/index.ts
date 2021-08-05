import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';
import { mf } from 'meteor/msgfmt:core';
import { Template } from 'meteor/templating';

import * as Alert from '/imports/api/alerts/alert';
import * as emailMethods from '/imports/api/emails/methods';

import './template.html';

Template.verifyEmail.onCreated(function () {
	this.sending = new ReactiveVar(false);
});

Template.verifyEmail.helpers({
	sending() {
		return Template.instance().sending.get();
	},
});

Template.verifyEmail.events({
	async 'click .js-verify-mail-btn'(event, instance) {
		instance.sending.set(true);

		try {
			await emailMethods.sendVerificationEmail();
			Alert.success(
				mf(
					'profile.sentVerificationMail',
					{ MAIL: Meteor.user().emails[0].address },
					'Verification mail has been sent to your address: "{MAIL}".',
				),
			);
		} catch (err) {
			instance.sending.set(false);
			Alert.serverError(err, 'Failed to send verification mail');
		}
	},
});

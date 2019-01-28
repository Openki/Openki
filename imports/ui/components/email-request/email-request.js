import { Template } from 'meteor/templating';

import EmailRequest from '/imports/ui/lib/email-request.js';
import { SetupWarnings } from '/imports/ui/lib/account-tools.js';
import { IsEmail } from '/imports/utils/email-tools.js';

import './email-request.html';

Template.emailRequest.helpers({
	showEmailRequest() {
		return EmailRequest.showEmailRequest();
	},
});

Template.emailRequestModal.onCreated(function() {
	this.busy(false);
	SetupWarnings(this, {
		'noEmail': {
			text: mf('register.warning.noEmailProvided', 'Please enter a email to register.'),
			selectors: ['#registerEmail']
		},
		'emailNotValid': {
			text: mf('register.warning.emailNotValid', 'your email seems to have an error.'),
			selectors: ['#registerEmail']
		},
		'emailExists': {
			text: mf('register.warning.emailExists', 'This email already exists. Have you tried resetting your password?'),
			selectors: ['#registerEmail']
		}
	});
});

Template.emailRequestModal.onRendered(function() {
	this.$(".js-email-request-modal").modal('show');
});

Template.emailRequestModal.events({
	'click .js-safe-email'(event, instance) {
		instance.busy('saving');
		event.preventDefault();
		const email = document.getElementById('registerEmail').value.trim();
		if(email.length === 0) {
			instance.setWarning('noEmail');
		} else if(!IsEmail(email)) {
			instance.setWarning('emailNotValid');
		} else {
			Meteor.call('user.updateEmail',
				email,
				function(err) {
					instance.busy(false);
					if (err) {
						const reason = err.reason;
						if (reason == 'Email address already in use') {
							instance.setWarning('emailExists');
						}
					} else {
						Alert.success(mf('profile.updated', 'Updated profile'));
						instance.$(".js-email-request-modal").modal('hide');
					}
				}
			);
		}
	}
});

Template.emailValidation.helpers({
	showEmailValidation() {
		return EmailRequest.showEmailValidation();
	}
});

Template.emailValidationModal.onCreated(function() {
	this.busy(false);
});

Template.emailValidationModal.onRendered(function() {
	this.$(".js-email-validation-modal").modal('show');
});
Template.emailValidationModal.events({
	'click .js-send-validation-email'(event, instance) {
		instance.busy('sending');
		event.preventDefault();
		Meteor.call('sendVerificationEmail', function(err) {
			instance.busy(false);
			if (err) {
				ShowServerError('Failed to send verification mail', err);
			} else {
				Alert.success(mf('profile.sentVerificationMail'));
				$('.js-email-validation-modal').modal('hide');
			}
		});
	}
});
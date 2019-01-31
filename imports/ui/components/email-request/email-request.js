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
			text: mf('register.warning.emailExists', 'This email already exists.'),
			selectors: ['#registerEmail']
		}
	});
});

Template.emailRequestModal.onRendered(function() {
	this.$(".js-email-request-modal").modal('show');
});

Template.emailRequestModal.events({
	'click .js-save-email'(event, instance) {
		instance.busy('saving');
		event.preventDefault();
		Meteor.call('user.updateEmail',
			document.getElementById('registerEmail').value.trim(),
			function(err) {
				instance.busy(false);
				if (err) {
					const reason = err.reason;
					switch(reason) {
						case 'Please enter a email.':
							instance.setWarning('noEmail');
							break;
						case 'Email address invalid':
							instance.setWarning('emailNotValid');
							break;
						case 'Email already exists.':
							instance.setWarning('emailExists');
							break;
						default:
							instance.setWarning("Unexpected error: $reason");
							break;
					}
				} else {
					Alert.success(mf('profile.updated', 'Updated profile'));
					instance.$(".js-email-request-modal").modal('hide');
				}
			}
		);
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
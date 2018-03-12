import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';

import ShowServerError from '/imports/ui/lib/show-server-error.js';
import { AddMessage } from '/imports/api/messages/methods.js';

import '/imports/ui/components/buttons/buttons.js';

import './reset-password.html';

Template.resetPassword.onCreated(function () {
	var instance = this;
	instance.busy(false);
	instance.password = new ReactiveVar("");
	instance.passwordValid = new ReactiveVar(false);
	instance.passwordSame = new ReactiveVar(false);
	instance.passwordNotSame = new ReactiveVar(false);
	instance.showPassword = new ReactiveVar(false);

	instance.updatePassword = function() {
		var password = $('.js-pwd-reset').val();
		instance.password.set(password);

		if (instance.showPassword.get()) {
			instance.passwordValid.set(password.length > 0);
		} else {
			var passwordConfirm = $('.js-confirm-pwd-reset').val();
			instance.passwordSame.set(password.length > 0 && password === passwordConfirm);
			instance.passwordNotSame.set(passwordConfirm && password.length <= passwordConfirm.length && password !== passwordConfirm);
			instance.passwordValid.set(password.length > 0 && password === passwordConfirm);
		}
	};
});


Template.resetPassword.helpers({
	'showPassword': function(action) {
		return Template.instance().showPassword.get();
	},

	'passwordSame': function(action) {
		return Template.instance().passwordSame.get();
	},

	'passwordNotSame': function(action) {
		return Template.instance().passwordNotSame.get();
	},

	'passwordFieldType': function(action) {
		return Template.instance().showPassword.get() ? "text" : "password";
	},

	'submitDisabled': function() {
		return Template.instance().passwordValid.get() ? '' : 'disabled';
	}
});

Template.resetPassword.events({
	'click .js-show-pwd': function(event, instance) {
		instance.showPassword.set(true);
		instance.updatePassword();
	},

	'click .js-hide-pwd': function(event, instance) {
		instance.showPassword.set(false);
		instance.updatePassword();
	},

	'input, keyup, blur': function(event, instance) {
		instance.updatePassword();
	},

	'submit': function(event, instance) {
		instance.busy("saving");
		event.preventDefault();

        var password = instance.$('.js-pwd-reset').val();
		var token = Template.instance().data;
		Accounts.resetPassword(token, password, function(err) {
			instance.busy(false);
			if (err) {
				ShowServerError('Unable to reset password', err);
			} else {
				AddMessage(mf('resetPassword.successMessage', 'Reset your password'), 'success');
				Router.go('profile');
			}
		});
    },

	'click .js-cancel-reset-pwd': function() {
		Router.go('/');
	}
});

import { Router } from 'meteor/iron:router';
import { mf } from 'meteor/msgfmt:core';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import Alert from '/imports/api/alerts/alert';

import '/imports/ui/components/buttons/buttons';

import './reset-password.html';

Template.resetPassword.onCreated(function () {
	const instance = this;
	instance.busy(false);
	instance.password = new ReactiveVar('');
	instance.passwordValid = new ReactiveVar(false);
	instance.passwordSame = new ReactiveVar(false);
	instance.passwordNotSame = new ReactiveVar(false);
	instance.showPassword = new ReactiveVar(false);

	instance.updatePassword = function () {
		const password = $('.js-pwd-reset').val();
		instance.password.set(password);

		if (instance.showPassword.get()) {
			instance.passwordValid.set(password.length > 0);
		} else {
			const passwordConfirm = $('.js-confirm-pwd-reset').val();
			instance.passwordSame.set(password.length > 0 && password === passwordConfirm);
			instance.passwordNotSame.set(
				passwordConfirm
				&& password.length <= passwordConfirm.length
				&& password !== passwordConfirm,
			);
			instance.passwordValid.set(password.length > 0 && password === passwordConfirm);
		}
	};
});


Template.resetPassword.helpers({
	showPassword() {
		return Template.instance().showPassword.get();
	},

	passwordSame() {
		return Template.instance().passwordSame.get();
	},

	passwordNotSame() {
		return Template.instance().passwordNotSame.get();
	},

	passwordFieldType() {
		return Template.instance().showPassword.get() ? 'text' : 'password';
	},

	submitDisabled() {
		return Template.instance().passwordValid.get() ? '' : 'disabled';
	},
});

Template.resetPassword.events({
	'click .js-show-pwd'(event, instance) {
		instance.showPassword.set(true);
		instance.updatePassword();
	},

	'click .js-hide-pwd'(event, instance) {
		instance.showPassword.set(false);
		instance.updatePassword();
	},

	'input, keyup, blur'(event, instance) {
		instance.updatePassword();
	},

	submit(event, instance) {
		instance.busy('saving');
		event.preventDefault();

		const password = instance.$('.js-pwd-reset').val();
		const token = Template.instance().data;
		Accounts.resetPassword(token, password, (err) => {
			instance.busy(false);
			if (err) {
				Alert.serverError(
					err,
					mf('resetPassword.passwordResetError', 'Unable to reset password'),
				);
			} else {
				Alert.success(mf('resetPassword.passwordReset.', 'Your password has been reset.'));
				Router.go('profile');
			}
		});
	},

	'click .js-cancel-reset-pwd'() {
		Router.go('/');
	},
});

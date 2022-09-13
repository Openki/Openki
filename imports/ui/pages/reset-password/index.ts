import { Router } from 'meteor/iron:router';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { AccountsAsync } from '/imports/utils/promisify';
import { i18n } from '/imports/startup/both/i18next';

import * as Alert from '/imports/api/alerts/alert';

import '/imports/ui/components/buttons';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	'resetPasswordPage',
	{ token: string },
	{
		password: ReactiveVar<string>;
		passwordValid: ReactiveVar<boolean>;
		passwordSame: ReactiveVar<boolean>;
		passwordNotSame: ReactiveVar<boolean>;
		showPassword: ReactiveVar<boolean>;
		updatePassword: () => void;
	}
>;

const template = Template.resetPasswordPage;

template.onCreated(function () {
	const instance = this;
	instance.busy(false);
	instance.password = new ReactiveVar('');
	instance.passwordValid = new ReactiveVar(false);
	instance.passwordSame = new ReactiveVar(false);
	instance.passwordNotSame = new ReactiveVar(false);
	instance.showPassword = new ReactiveVar(false);

	instance.updatePassword = function () {
		const password = $('.js-pwd-reset').val() as string;
		instance.password.set(password);

		if (instance.showPassword.get()) {
			instance.passwordValid.set(password.length > 0);
		} else {
			const passwordConfirm = $('.js-confirm-pwd-reset').val() as string;
			instance.passwordSame.set(password.length > 0 && password === passwordConfirm);
			instance.passwordNotSame.set(
				!!passwordConfirm &&
					password.length <= passwordConfirm.length &&
					password !== passwordConfirm,
			);
			instance.passwordValid.set(password.length > 0 && password === passwordConfirm);
		}
	};
});

template.helpers({
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

template.events({
	'click .js-show-pwd'(_event, instance) {
		instance.showPassword.set(true);
		instance.updatePassword();
	},

	'click .js-hide-pwd'(_event, instance) {
		instance.showPassword.set(false);
		instance.updatePassword();
	},

	'input, keyup, blur'(_event, instance) {
		instance.updatePassword();
	},

	async submit(event, instance) {
		instance.busy('saving');
		event.preventDefault();

		const password = instance.$('.js-pwd-reset').val() as string;
		const { token } = Template.currentData();

		try {
			await AccountsAsync.resetPassword(token, password);

			Alert.success(i18n('resetPassword.passwordReset.', 'Your password has been reset.'));
			Router.go('profile');
		} catch (err) {
			Alert.serverError(err, i18n('resetPassword.passwordResetError', 'Unable to reset password'));
		} finally {
			instance.busy(false);
		}
	},

	'click .js-cancel-reset-pwd'() {
		Router.go('/');
	},
});

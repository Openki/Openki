import { Meteor } from 'meteor/meteor';
import { i18n } from '/imports/startup/both/i18next';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Random } from 'meteor/random';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { AccountsAsync, MeteorAsync } from '/imports/utils/promisify';

import * as Alert from '/imports/api/alerts/alert';
import * as UsersMethods from '/imports/api/users/methods';
import { Regions } from '/imports/api/regions/regions';

import { PublicSettings } from '/imports/utils/PublicSettings';
import { isEmail } from '/imports/utils/email-tools';

import { ScssVars } from '/imports/ui/lib/scss-vars';
import * as TemplateMixins from '/imports/ui/lib/template-mixins';
import * as Viewport from '/imports/ui/lib/viewport';
import * as Analytics from '/imports/ui/lib/analytics';
import { CleanedRegion } from '/imports/ui/lib/cleaned-region';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	'forgotPwdFrame',
	unknown,
	{ emailIsValid: ReactiveVar<boolean> }
>;

const template = Template.forgotPwdFrame;

template.onCreated(function () {
	const instance = this;
	instance.busy(false);
	instance.emailIsValid = new ReactiveVar(false);
});

template.onRendered(function () {
	const instance = this;
	const { transferMail } = instance.parentInstance() as any;
	if (transferMail) {
		instance.$('.js-reset-pw-email').val(transferMail);
		instance.emailIsValid.set(true);
	}

	instance.$('input').first().trigger('select');
});

template.helpers({
	noValidEmail() {
		return !Template.instance().emailIsValid.get();
	},
});

template.events({
	'input, change, paste, keyup, mouseup'(_event, instance) {
		const email = instance.$('.js-reset-pw-email').val() as string;
		instance.emailIsValid.set(isEmail(email));
	},

	async submit(event, instance) {
		event.preventDefault();
		instance.busy('requesting-pw-reset');

		try {
			await AccountsAsync.forgotPassword({
				email: instance.$('.js-reset-pw-email').val() as string,
			});

			Alert.success(
				i18n(
					'forgotPassword.emailSent',
					'An e-mail with further instructions on how to reset your password has been sent to you.',
				),
			);
			(instance.parentInstance() as any).accountTask.set('login');
		} catch (err) {
			Alert.serverError(
				err,
				i18n('forgotPassword.emailSent.error', 'We were unable to send a mail to this address'),
			);
		} finally {
			instance.busy(false);
		}
	},

	'click .js-reset-pwd-close-btn'(_event, instance) {
		(instance.parentInstance() as any).accountTask.set('login');
	},
});

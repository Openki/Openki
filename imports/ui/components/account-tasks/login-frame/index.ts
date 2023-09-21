import { Meteor } from 'meteor/meteor';
import { i18n } from '/imports/startup/both/i18next';
import { Session } from 'meteor/session';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { MeteorAsync } from '/imports/utils/promisify';

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

const Template = TemplateMixins.FormfieldErrors(
	TemplateAny as TemplateStaticTyped<
		'loginFrame',
		unknown,
		{
			OAuthServices: {
				key: string;
				name: string;
				serviceName: string;
			}[];
		}
	>,
	'loginFrame',
	{
		noUsername: {
			text: () =>
				i18n('login.warning.noUserName', 'Please enter your username or e-mail address to log in.'),
			field: 'username',
		},
		'Incorrect password': {
			text: () => i18n('login.password.password_incorrect', 'Incorrect password'),
			field: 'password',
		},
		'User not found': {
			text: () => i18n('login.username.usr_doesnt_exist', 'This user does not exist.'),
			field: 'username',
		},
		'User has no password set': {
			text: () => i18n('login.username.no_password_set', 'Please log in below.'),
			field: 'username',
		},
	},
);

const template = Template.loginFrame;

template.onCreated(function () {
	const instance = this;

	instance.busy(false);

	const oAuthServices = [];
	const login = PublicSettings.feature.login;
	if (login.google) {
		oAuthServices.push({
			key: 'google',
			name: 'Google',
			serviceName: 'Google',
		});
	}
	if (login.facebook) {
		oAuthServices.push({
			key: 'facebook',
			name: 'Facebook',
			serviceName: 'Facebook',
		});
	}
	if (login.github) {
		oAuthServices.push({
			key: 'github',
			name: 'GitHub',
			serviceName: 'Github',
		});
	}
	instance.OAuthServices = oAuthServices;
});

template.onRendered(function () {
	const { transferMail } = this.parentInstance() as any;
	if (transferMail) {
		this.$('.js-username').val(transferMail);
	}

	this.$('input').first().trigger('select');
});

template.helpers({
	OAuthServices() {
		return Template.instance().OAuthServices;
	},
});

template.events({
	'click .js-forgot-pwd-btn'(event, instance) {
		event.preventDefault();

		const username = instance.$('.js-username').val() as string;
		if (isEmail(username)) {
			/* eslint-disable-next-line no-param-reassign */
			(instance.parentInstance() as any).transferMail = username;
		}

		(instance.parentInstance() as any).accountTask.set('recoverPwd');
	},

	'click .js-visitor-open'(_event, instance) {
		const parentInstance = instance.parentInstance() as any;

		parentInstance.accountTask.set('visitor');
	},

	'click .js-register-open'(_event, instance) {
		let username = instance.$('.js-username').val() as string;
		const password = instance.$('.js-password').val() as string;
		let email;

		// Sometimes people register with their email address in the first field
		// Move entered username over to email field if it contains a @
		if (isEmail(username)) {
			email = username;
			username = '';
		}

		const parentInstance = instance.parentInstance() as any;
		parentInstance.transferUsername = username;
		parentInstance.transferPassword = password;
		parentInstance.transferMail = email;

		parentInstance.accountTask.set('register');
	},

	async 'submit form, click .js-login'(event, instance) {
		event.preventDefault();
		instance.errors.reset();

		const user = instance.$('.js-username').val() as string;
		if (!user) {
			instance.errors.add('noUsername');
		}

		if (instance.errors.present()) {
			return;
		}

		const password = instance.$('.js-password').val() as string;

		instance.busy('logging-in');
		try {
			await MeteorAsync.loginWithPassword(user, password);

			if (Viewport.get().width <= ScssVars.gridFloatBreakpoint) {
				$('#bs-navbar-collapse').collapse('hide');
			}
			$('.js-account-tasks').modal('hide');

			const regionId = CleanedRegion(Session.get('region'));
			if (regionId) {
				await UsersMethods.regionChange(regionId);
			}

			await UsersMethods.updateLocale(Session.get('locale'));

			Analytics.trackEvent(
				'Logins',
				'Logins with password',
				regionId ? Regions.findOne(regionId)?.nameEn : '',
			);
		} catch (err) {
			instance.errors.add(err.reason);
		} finally {
			instance.busy(false);
		}
	},

	async 'click .js-oauth-btn'(event, instance) {
		event.preventDefault();

		const { service } = event.currentTarget.dataset;
		const loginMethod = `loginWith${service}`;
		if (!(Meteor as any)[loginMethod]) {
			Alert.serverError(new Error(`don't have ${loginMethod}`));
			return;
		}

		instance.busy(service);
		(Meteor as any)[loginMethod]({}, async (err: any) => {
			instance.busy(false);
			if (err) {
				Alert.serverError(err);
			} else {
				if (Viewport.get().width <= ScssVars.gridFloatBreakpoint) {
					$('#bs-navbar-collapse').collapse('hide');
				}
				$('.js-account-tasks').modal('hide');

				const regionId = CleanedRegion(Session.get('region'));
				if (regionId) {
					await UsersMethods.regionChange(regionId);
				}

				await UsersMethods.updateLocale(Session.get('locale'));

				Analytics.trackEvent(
					'Logins',
					`Logins with ${service}`,
					Regions.findOne(Meteor.user()?.profile.regionId)?.nameEn,
				);
			}
		});
	},
});

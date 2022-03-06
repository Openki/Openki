import { Meteor } from 'meteor/meteor';
import { i18n } from '/imports/startup/both/i18next';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import * as Alert from '/imports/api/alerts/alert';
import * as UsersMethods from '/imports/api/users/methods';

import CleanedRegion from '/imports/ui/lib/cleaned-region';
import { ScssVars } from '/imports/ui/lib/scss-vars';
import * as TemplateMixins from '/imports/ui/lib/template-mixins';
import * as Viewport from '/imports/ui/lib/viewport';

import { isEmail } from '/imports/utils/email-tools';
import { AccountsAsync, MeteorAsync } from '/imports/utils/promisify';

import { Regions } from '/imports/api/regions/regions';
import { Analytics } from '/imports/ui/lib/analytics';

import './template.html';
import './styles.scss';

{
	const Template = TemplateAny as TemplateStaticTyped<
		'accountTasks',
		unknown,
		{
			accountTask: ReactiveVar<string>;
			transferUsername: boolean;
			transferPassword: boolean;
			transferMail: boolean;
		}
	>;

	const template = Template.accountTasks;

	template.onCreated(function () {
		const instance = this;

		instance.accountTask = new ReactiveVar('login');
		instance.autorun(() => {
			if (Session.equals('pleaseLogin', true)) {
				instance.$('.js-account-tasks').modal('show');
			}
		});
	});

	template.helpers({
		activeAccountTask(task: string) {
			return Template.instance().accountTask.get() === task;
		},
		pleaseLogin() {
			return Session.get('pleaseLogin');
		},
	});

	template.events({
		'show.bs.modal .js-account-tasks'(_event, instance) {
			/* eslint-disable-next-line no-param-reassign */
			instance.transferUsername = false;
			/* eslint-disable-next-line no-param-reassign */
			instance.transferPassword = false;
			/* eslint-disable-next-line no-param-reassign */
			instance.transferMail = false;
		},

		'shown.bs.modal .js-account-tasks'(_event, instance) {
			instance.$('input').first().trigger('select');
		},

		'hide.bs.modal .js-account-tasks'(_event, instance) {
			instance.$('input').val('');
		},

		'hidden.bs.modal .js-account-tasks'(_event, instance) {
			instance.accountTask.set('login');
			Session.set('pleaseLogin', false);
		},
	});
}

{
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
					i18n(
						'login.warning.noUserName',
						'Please enter your username or e-mail address to log in.',
					),
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
		const login = Meteor.settings.public.feature?.login;
		if (login?.google) {
			oAuthServices.push({
				key: 'google',
				name: 'Google',
				serviceName: 'Google',
			});
		}
		if (login?.facebook) {
			oAuthServices.push({
				key: 'facebook',
				name: 'Facebook',
				serviceName: 'Facebook',
			});
		}
		if (login?.github) {
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

		'click .js-register-open'(_event, instance) {
			let username = instance.$('.js-username').val() as string;
			const password = instance.$('.js-password').val() as string;
			let email;

			// Sometimes people register with their email address in the first field
			// Move entered username over to email field if it contains a @
			if (isEmail(username)) {
				email = username;
				username = email.substring(0, email.indexOf('@'));
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
					$('#bs-navbar-collapse-1').collapse('hide');
				}
				$('.js-account-tasks').modal('hide');

				const regionId = CleanedRegion(Session.get(`region`));
				if (regionId) {
					UsersMethods.regionChange(regionId);
				}

				UsersMethods.updateLocale(Session.get('locale'));

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

		'click .js-oauth-btn'(event, instance) {
			event.preventDefault();

			const { service } = event.currentTarget.dataset;
			const loginMethod = `loginWith${service}`;
			if (!(Meteor as any)[loginMethod]) {
				Alert.serverError(new Error(`don't have ${loginMethod}`), '');
				return;
			}

			instance.busy(service);
			(Meteor as any)[loginMethod]({}, (err: any) => {
				instance.busy(false);
				if (err) {
					Alert.serverError(err, '');
				} else {
					if (Viewport.get().width <= ScssVars.gridFloatBreakpoint) {
						$('#bs-navbar-collapse-1').collapse('hide');
					}
					$('.js-account-tasks').modal('hide');

					const regionId = CleanedRegion(Session.get('region'));
					if (regionId) {
						UsersMethods.regionChange(regionId);
					}

					UsersMethods.updateLocale(Session.get('locale'));

					Analytics.trackEvent(
						'Logins',
						`Logins with ${service}`,
						Regions.findOne(Meteor.user()?.profile.regionId)?.nameEn,
					);
				}
			});
		},
	});

	template.helpers({
		pleaseLogin() {
			return Session.get('pleaseLogin');
		},

		loginAction() {
			return Session.get('loginAction');
		},

		OAuthServices() {
			return Template.instance().OAuthServices;
		},
	});
}

{
	const Template = TemplateMixins.FormfieldErrors(
		TemplateAny as TemplateStaticTyped<'registerFrame'>,
		'registerFrame',
		{
			noUsername: {
				text() {
					return i18n('register.warning.noUserName', 'Please enter a name for your new user.');
				},
				field: 'username',
			},
			'Username already exists.': {
				text() {
					return i18n(
						'register.warning.userExists',
						'This username is already in use. Please choose another one.',
					);
				},
				field: 'username',
			},
			noPassword: {
				text() {
					return i18n(
						'register.warning.noPasswordProvided',
						'Please enter a password to register.',
					);
				},
				field: 'password',
			},
			noEmail: {
				text() {
					return i18n(
						'register.warning.noEmailProvided',
						'Please enter an email-address to register.',
					);
				},
				field: 'email',
			},
			'email invalid': {
				text() {
					return i18n('register.warning.emailNotValid');
				},
				field: 'email',
			},
			'Email already exists.': {
				text() {
					return i18n(
						'register.warning.emailExists',
						'This email already exists. Have you tried resetting your password?',
					);
				},
				field: 'email',
			},
		},
	);

	const template = Template.registerFrame;

	template.onCreated(function () {
		const instance = this;
		instance.busy(false);
	});

	template.onRendered(function () {
		const instance = this;

		const parentInstance = instance.parentInstance() as any;

		const { transferUsername, transferPassword, transferMail } = parentInstance;

		if (transferUsername) {
			instance.$('.js-username').val(transferUsername);
		}

		if (transferPassword) {
			instance.$('.js-password').val(transferPassword);
		}

		if (transferMail) {
			instance.$('.js-email').val(transferMail);
		}

		instance.$('input').first().trigger('select');
	});

	template.helpers({
		pleaseLogin() {
			return Session.get('pleaseLogin');
		},

		registerAction() {
			return Session.get('registerAction');
		},
	});

	template.events({
		async 'click .js-register'(event, instance) {
			event.preventDefault();
			instance.errors.reset();

			const username = instance.$('.js-username').val() as string;
			if (!username) {
				instance.errors.add('noUsername');
			}

			const password = instance.$('.js-password').val() as string;
			if (!password) {
				instance.errors.add('noPassword');
			}

			const email = instance.$('.js-email').val() as string;
			if (!email) {
				instance.errors.add('noEmail');
			}

			if (instance.errors.present()) {
				return;
			}

			instance.busy('registering');

			try {
				await AccountsAsync.createUser({
					username,
					password,
					email,
					locale: Session.get('locale'),
				} as any);

				if (Viewport.get().width <= ScssVars.gridFloatBreakpoint) {
					$('#bs-navbar-collapse-1').collapse('hide');
				}
				$('.js-account-tasks').modal('hide');

				const regionId = CleanedRegion(Session.get('region'));
				if (regionId) {
					UsersMethods.regionChange(regionId);
				}

				UsersMethods.updateLocale(Session.get('locale'));

				const user = Meteor.user();

				if (!user) {
					throw new Error('Unexpected falsy: user');
				}

				Alert.success(
					i18n(
						'profile.sentVerificationMail',
						'Verification mail has been sent to your address: "{MAIL}".',
						{ MAIL: user.emails[0].address },
					),
				);

				Analytics.trackEvent(
					'Registers',
					'Registers with password',
					Regions.findOne(user.profile.regionId)?.nameEn,
				);
			} catch (err) {
				instance.errors.add(err.reason);
			} finally {
				instance.busy(false);
			}
		},

		'click .js-back-to-login'(_event, instance) {
			(instance.parentInstance() as any).accountTask.set('login');
		},
	});
}
{
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
				Alert.serverError(err, 'We were unable to send a mail to this address');
			} finally {
				instance.busy(false);
			}
		},

		'click .js-reset-pwd-close-btn'(_event, instance) {
			(instance.parentInstance() as any).accountTask.set('login');
		},
	});
}

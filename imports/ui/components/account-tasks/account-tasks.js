import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import Alert from '/imports/api/alerts/alert';

import CleanedRegion from '/imports/ui/lib/cleaned-region';
import ScssVars from '/imports/ui/lib/scss-vars';
import TemplateMixins from '/imports/ui/lib/template-mixins';

import IsEmail from '/imports/utils/email-tools';

import './account-tasks.html';

Template.accountTasks.onCreated(function () {
	this.accountTask = new ReactiveVar('login');
	this.autorun(() => {
		if (Session.equals('pleaseLogin', true)) {
			this.$('.js-account-tasks').modal('show');
		}
	});
});

Template.accountTasks.helpers({
	activeAccountTask: (task) => Template.instance().accountTask.get() === task,
	pleaseLogin: () => Session.get('pleaseLogin'),
});

Template.accountTasks.events({
	'show.bs.modal .js-account-tasks'(event, instance) {
		/* eslint-disable-next-line no-param-reassign */
		instance.transferUsername = false;
		/* eslint-disable-next-line no-param-reassign */
		instance.transferPassword = false;
		/* eslint-disable-next-line no-param-reassign */
		instance.transferMail = false;
	},

	'shown.bs.modal .js-account-tasks'(event, instance) {
		instance.$('input').first().select();
	},

	'hide.bs.modal .js-account-tasks'(event, instance) {
		instance.$('input').val('');
	},

	'hidden.bs.modal .js-account-tasks'(event, instance) {
		instance.accountTask.set('login');
		Session.set('pleaseLogin', false);
	},
});

Template.loginFrame.onCreated(function () {
	this.busy(false);

	const oAuthServices = [];
	const login = Meteor.settings.public.feature?.login;
	if (login?.google) {
		oAuthServices.push(
			{
				key: 'google',
				name: 'Google',
				serviceName: 'Google',
			},
		);
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
	this.OAuthServices = oAuthServices;
});

Template.loginFrame.onRendered(function () {
	const { transferMail } = this.parentInstance();
	if (transferMail) {
		this.$('.js-username').val(transferMail);
	}

	this.$('input').first().select();
});

Template.loginFrame.onDestroyed(() => {
	Session.set('pleaseLogin', false);
});

TemplateMixins.FormfieldErrors(Template.loginFrame, {
	noUsername: {
		text: () => mf(
			'login.warning.noUserName',
			'Please enter your username or email to log in.',
		),
		field: 'username',
	},
	'Incorrect password': {
		text: () => mf(
			'login.password.password_incorrect',
			'Incorrect password',
		),
		field: 'password',
	},
	'User not found': {
		text: () => mf(
			'login.username.usr_doesnt_exist',
			'This user does not exist.',
		),
		field: 'username',
	},
	'User has no password set': {
		text: () => mf(
			'login.username.no_password_set',
			'Please login below with Google/Facebook.',
		),
		field: 'username',
	},
});

Template.loginFrame.events({
	'click .js-forgot-pwd-btn'(event, instance) {
		event.preventDefault();

		const username = instance.$('.js-username').val();
		if (IsEmail(username)) {
			/* eslint-disable-next-line no-param-reassign */
			instance.parentInstance().transferMail = username;
		}

		instance.parentInstance().accountTask.set('recoverPwd');
	},

	'click .js-register-open'(event, instance) {
		let username = instance.$('.js-username').val();
		const password = instance.$('.js-password').val();
		let email;

		// Sometimes people register with their email address in the first field
		// Move entered username over to email field if it contains a @
		if (IsEmail(username)) {
			email = username;
			username = email.substr(0, email.indexOf('@'));
		}

		const parentInstance = instance.parentInstance();
		parentInstance.transferUsername = username;
		parentInstance.transferPassword = password;
		parentInstance.transferMail = email;

		instance.parentInstance().accountTask.set('register');
	},

	'submit form, click .js-login'(event, instance) {
		event.preventDefault();
		instance.errors.reset();

		const user = instance.$('.js-username').val();
		if (!user) {
			instance.errors.add('noUsername');
		}

		if (instance.errors.present()) {
			return;
		}

		const password = instance.$('.js-password').val();

		instance.busy('logging-in');
		Meteor.loginWithPassword(user, password, (err) => {
			instance.busy(false);
			if (err) {
				instance.errors.add(err.reason);
			} else {
				if (Session.get('viewportWidth') <= ScssVars.gridFloatBreakpoint) {
					$('#bs-navbar-collapse-1').collapse('hide');
				}
				$('.js-account-tasks').modal('hide');
			}
		});
	},

	'click .js-oauth-btn'(event, instance) {
		event.preventDefault();

		const { service } = event.currentTarget.dataset;
		const loginMethod = `loginWith${service}`;
		if (!Meteor[loginMethod]) {
			Alert.serverError(
				new Error(`don't have ${loginMethod}`),
				'',
			);
			return;
		}

		instance.busy(service);
		Meteor[loginMethod]({
		}, (err) => {
			instance.busy(false);
			if (err) {
				Alert.serverError(err, '');
			} else {
				if (Session.get('viewportWidth') <= ScssVars.gridFloatBreakpoint) {
					$('#bs-navbar-collapse-1').collapse('hide');
				}
				$('.js-account-tasks').modal('hide');
			}
		});
	},
});

Template.loginFrame.helpers({
	pleaseLogin: () => Session.get('pleaseLogin'),

	loginAction: () => Session.get('loginAction'),

	OAuthServices: () => Template.instance().OAuthServices,
});

Template.registerFrame.onCreated(function () {
	this.busy(false);
});

Template.registerFrame.onRendered(function () {
	const parentInstance = this.parentInstance();

	const { transferUsername, transferPassword, transferMail } = parentInstance;

	if (transferUsername) {
		this.$('.js-username').val(transferUsername);
	}

	if (transferPassword) {
		this.$('.js-password').val(transferPassword);
	}

	if (transferMail) {
		this.$('.js-email').val(transferMail);
	}

	this.$('input').first().select();
});

TemplateMixins.FormfieldErrors(Template.registerFrame, {
	noUsername: {
		text: () => mf(
			'register.warning.noUserName',
			'Please enter a name for your new user.',
		),
		field: 'username',
	},
	'Username already exists.': {
		text: () => mf(
			'register.warning.userExists',
			'This username already exists. Please choose another one.',
		),
		field: 'username',
	},
	noPassword: {
		text: () => mf(
			'register.warning.noPasswordProvided',
			'Please enter a password to register.',
		),
		field: 'password',
	},
	noEmail: {
		text: () => mf(
			'register.warning.noEmailProvided',
			'Please enter an email-address to register.',
		),
		field: 'email',
	},
	'email invalid': {
		text: () => mf('register.warning.emailNotValid'),
		field: 'email',
	},
	'Email already exists.': {
		text: () => mf(
			'register.warning.emailExists',
			'This email already exists. Have you tried resetting your password?',
		),
		field: 'email',
	},
});

Template.registerFrame.events({
	'click .js-register'(event, instance) {
		event.preventDefault();
		instance.errors.reset();

		const username = instance.$('.js-username').val();
		if (!username) {
			instance.errors.add('noUsername');
		}

		const password = instance.$('.js-password').val();
		if (!password) {
			instance.errors.add('noPassword');
		}

		const email = instance.$('.js-email').val();
		if (!email) {
			instance.errors.add('noEmail');
		}

		if (instance.errors.present()) {
			return;
		}

		instance.busy('registering');
		Accounts.createUser({
			username, password, email, profile: { locale: Session.get('locale') },
		}, (err) => {
			instance.busy(false);
			if (err) {
				instance.errors.add(err.reason);
			} else {
				if (Session.get('viewportWidth') <= ScssVars.gridFloatBreakpoint) {
					$('#bs-navbar-collapse-1').collapse('hide');
				}
				$('.js-account-tasks').modal('hide');
				const regionId = CleanedRegion(Session.get('region'));
				if (regionId) {
					Meteor.call('user.regionChange', regionId);
				}
			}
		});
	},

	'click .js-back-to-login'(event, instance) {
		instance.parentInstance().accountTask.set('login');
	},
});

Template.forgotPwdFrame.onCreated(function () {
	this.busy(false);
	this.emailIsValid = new ReactiveVar(false);
});

Template.forgotPwdFrame.onRendered(function () {
	const { transferMail } = this.parentInstance();
	if (transferMail) {
		this.$('.js-reset-pw-email').val(transferMail);
		this.emailIsValid.set(true);
	}

	this.$('input').first().select();
});

Template.forgotPwdFrame.helpers({
	noValidEmail: () => !Template.instance().emailIsValid.get(),
});

Template.forgotPwdFrame.events({
	'input, change, paste, keyup, mouseup'(event, instance) {
		const email = instance.$('.js-reset-pw-email').val();
		instance.emailIsValid.set(IsEmail(email));
	},

	submit(event, instance) {
		event.preventDefault();
		instance.busy('requesting-pw-reset');
		Accounts.forgotPassword({
			email: instance.$('.js-reset-pw-email').val(),
		}, (err) => {
			instance.busy(false);
			if (err) {
				Alert.serverError(err, 'We were unable to send a mail to this address');
			} else {
				Alert.success(mf(
					'forgotPassword.emailSent',
					'An e-mail with further instructions on how to reset your password has been sent to you.',
				));
				instance.parentInstance().accountTask.set('login');
			}
		});
	},

	'click .js-reset-pwd-close-btn'(event, instance) {
		instance.parentInstance().accountTask.set('login');
	},
});

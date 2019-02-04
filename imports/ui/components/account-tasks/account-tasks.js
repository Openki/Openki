import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import CleanedRegion from '/imports/ui/lib/cleaned-region.js';
import { FormfieldErrors } from '/imports/ui/lib/formfield-errors.js';
import { IsEmail } from '/imports/utils/email-tools.js';
import Alert from '/imports/api/alerts/alert.js';
import ScssVars from '/imports/ui/lib/scss-vars.js';

import './account-tasks.html';

Template.accountTasks.onCreated(function() {
	this.accountTask = new ReactiveVar('login');
	this.autorun(() => {
		if (Session.equals('pleaseLogin', true)) {
			this.$('#accountTasks').modal('show');
		}
	});
});

Template.accountTasks.helpers({
	activeAccountTask: (task) => Template.instance().accountTask.get() == task,
	pleaseLogin: () => Session.get('pleaseLogin')
});

Template.accountTasks.events({
	'show.bs.modal #accountTasks'(event, instance) {
		instance.transferUsername = false;
		instance.transferPassword = false;
		instance.transferMail = false;
	},

	'shown.bs.modal #accountTasks'(event, instance) {
		instance.$('input').first().select();
	},

	'hide.bs.modal #accountTasks'(event, instance) {
		instance.$('input').val('');
	},

	'hidden.bs.modal #accountTasks'(event, instance) {
		instance.accountTask.set('login');
		Session.set('pleaseLogin', false);
	}
});

Template.loginFrame.onCreated(function() {
	this.busy(false);

	this.OAuthServices =
		[
			{ key: 'google'
			, name: 'Google'
			, serviceName: 'Google'
			}
		,
			{ key: 'facebook'
			, name: 'Facebook'
			, serviceName: 'Facebook'
			}
		,
			{ key: 'github'
			, name: 'GitHub'
			, serviceName: 'Github'
			}
		];

	FormfieldErrors(this, {
		'noUserName': {
			text: mf('login.warning.noUserName', 'Please enter your username or email to log in.'),
			selectors: ['#loginName']
		},
		'noCredentials': {
			text: mf('login.login.warning', 'Please enter your username or email and password to log in.'),
			selectors: ['#loginName', '#loginPassword']
		},
		'noPassword': {
			text: mf('login.password.password_incorrect', 'Incorrect password'),
			selectors: ['#loginPassword']
		},
		'userNotFound': {
			text: mf('login.username.usr_doesnt_exist', 'This user does not exist.'),
			selectors: ['#loginName']
		}
	});
});

Template.loginFrame.onRendered(function() {
	const transferMail = this.parentInstance().transferMail;
	if (transferMail) this.$('#loginName').val(transferMail);

	this.$('input').first().select();
});

Template.loginFrame.onDestroyed(function() {
	Session.set('pleaseLogin', false);
});

Template.loginFrame.events({
	'click .js-forgot-pwd-btn'(event, instance) {
		event.preventDefault();

		const username = instance.$('#loginName').val();
		if (IsEmail(username)) {
			instance.parentInstance().transferMail = username;
		}

		instance.parentInstance().accountTask.set('recoverPwd');
	},

	'click .js-register-open'(event, instance) {
		let username = instance.$('#loginName').val();
		const password = instance.$('#loginPassword').val();
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

	'submit form, click .js-login'(event, instance){
		event.preventDefault();
		const user = instance.$('#loginName').val();
		const password = instance.$('#loginPassword').val();

		instance.busy('logging-in');
		Meteor.loginWithPassword(user, password, function(err) {
			instance.busy(false);
			if (err) {
				const reason = err.reason;
				if (reason == 'Match failed') {
					instance.setError(!instance.$('#loginPassword').val()
						? 'noCredentials'
						: 'noUserName');
				}

				if (reason == 'Incorrect password') {
					instance.setError('noPassword');
				}

				if (reason == 'User not found') {
					instance.setError('userNotFound');
				}
			} else {
				if (Session.get('viewportWidth') <= ScssVars.gridFloatBreakpoint) {
					$('#bs-navbar-collapse-1').collapse('hide');
				}
				$('#accountTasks').modal('hide');
			}
		});
	},

	'click .js-oauth-btn'(event, instance) {
		event.preventDefault();

		const service = event.currentTarget.dataset.service;
		const loginMethod = 'loginWith' + service;
		if (!Meteor[loginMethod]) {
			console.log("don't have "+loginMethod);
			return;
		}

		instance.busy(service);
		Meteor[loginMethod]({
		}, function (err) {
			instance.busy(false);
			if (err) {
				Alert.error(err, '');
			} else {
				if (Session.get('viewportWidth') <= ScssVars.gridFloatBreakpoint) {
					$('#bs-navbar-collapse-1').collapse('hide');
				}
				$('#accountTasks').modal('hide');
			}
		});
	}
});

Template.loginFrame.helpers({
	pleaseLogin: () => Session.get('pleaseLogin'),

	loginAction: () => Session.get('loginAction'),

	OAuthServices: () => Template.instance().OAuthServices
});

Template.registerFrame.onCreated(function() {
	this.busy(false);
	FormfieldErrors(this, {
		'noUserName': {
			text: mf('register.warning.noUserName', 'Please enter a name for your new user.'),
			selectors: ['#registerName']
		},
		'noPassword': {
			text: mf('register.warning.noPasswordProvided', 'Please enter a password to register.'),
			selectors: ['#registerPassword']
		},
		'noEmail': {
			text: mf('register.warning.noEmailProvided', 'Please enter a email to register.'),
			selectors: ['#registerEmail']
		},
		'noCredentials': {
			text: mf('register.warning.noCredentials', 'Please enter a username, password and a email to register.'),
			selectors: ['#registerName', '#registerPassword', '#registerEmail']
		},
		'userExists': {
			text: mf('register.warning.userExists', 'This username already exists. Please choose another one.'),
			selectors: ['#registerName']
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

Template.registerFrame.onRendered(function() {
	const parentInstance = this.parentInstance();

	const transferUsername = parentInstance.transferUsername;
	if (transferUsername) this.$('#registerName').val(transferUsername);

	const transferPassword = parentInstance.transferPassword;
	if (transferPassword) this.$('#registerPassword').val(transferPassword);

	const transferMail = parentInstance.transferMail;
	if (transferMail) this.$('#registerEmail').val(transferMail);

	this.$('input').first().select();
});

Template.registerFrame.events({
	'click .js-register'(event, instance) {
		event.preventDefault();

		const username = instance.$('#registerName').val();
		const password = instance.$('#registerPassword').val();
		const email = instance.$('#registerEmail').val();

		instance.busy('registering');
		Accounts.createUser({ username,	password, email	}, (err) => {
			instance.busy(false);
			if (err) {
				const reason = err.reason;
				if (reason == 'Need to set a username or email') {
					instance.setError('noUserName');
				}

				if (reason == 'Password may not be empty') {
					instance.setError(!instance.$('#registerName').val()
						? 'noCredentials'
						: 'noPassword');
				}

				if (reason == 'Username already exists.') {
					instance.setError('userExists');
				}

				if (reason == 'user must provide a email') {
					instance.setError('noEmail');
				}

				if (reason == 'user must provide a valid email') {
					instance.setError('emailNotValid');
				}

				if (reason == 'Email already exists.') {
					instance.setError('emailExists');
				}
			} else {
				if (Session.get('viewportWidth') <= ScssVars.gridFloatBreakpoint) {
					$('#bs-navbar-collapse-1').collapse('hide');
				}
				$('#accountTasks').modal('hide');
				const regionId = CleanedRegion(Session.get('region'));
				if (regionId) {
					Meteor.call('user.regionChange', regionId);
				}
			}
		});
	},

	'click #backToLogin'(event, instance) {
		instance.parentInstance().accountTask.set('login');
	}
});

Template.forgotPwdFrame.onCreated(function() {
	this.busy(false);
	this.emailIsValid = new ReactiveVar(false);
});

Template.forgotPwdFrame.onRendered(function() {
	const transferMail = this.parentInstance().transferMail;
	if (transferMail) {
		this.$('.js-reset-pw-email').val(transferMail);
		this.emailIsValid.set(true);
	}

	this.$('input').first().select();
});

Template.forgotPwdFrame.helpers({
	noValidEmail: () => !Template.instance().emailIsValid.get()
});

Template.forgotPwdFrame.events({
	'input, change, paste, keyup, mouseup'(event, instance) {
		const email = instance.$('.js-reset-pw-email').val();
		instance.emailIsValid.set(IsEmail(email));
	},

	'submit'(event, instance) {
		event.preventDefault();
		instance.busy('requesting-pw-reset');
		Accounts.forgotPassword({
			email: instance.$('.js-reset-pw-email').val()
		}, function(err) {
			instance.busy(false);
			if (err) {
				Alert.error(err, 'We were unable to send a mail to this address');
			} else {
				Alert.success(mf(
					'forgotPassword.emailSent',
					'An e-mail with further instructions on how to reset your password has been sent to you.'
				));
				instance.parentInstance().accountTask.set('login');
			}
		});
	},

	'click .js-reset-pwd-close-btn'(event, instance) {
		instance.parentInstance().accountTask.set('login');
	},
});

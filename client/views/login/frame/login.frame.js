import AccountTools from '/imports/ui/account/AccountTools.js';

Template.accountTasks.onCreated(function() {
	this.accountTask = new ReactiveVar('login');
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

	AccountTools.SetupWarnings(this, {
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
		if (AccountTools.IsEmail(username)) {
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
		if (AccountTools.IsEmail(username)) {
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
					instance.setWarning(!instance.$('#loginPassword').val()
						? 'noCredentials'
						: 'noUserName');
				}

				if (reason == 'Incorrect password') {
					instance.setWarning('noPassword');
				}

				if (reason == 'User not found') {
					instance.setWarning('userNotFound');
				}
			} else {
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
				addMessage(err.reason || 'Unknown error', 'danger');
			} else {
				$('#accountTasks').modal('hide');
			}
		});
	}
});

Template.loginFrame.helpers({
	OAuthServices: () => Template.instance().OAuthServices
});

Template.registerFrame.onCreated(function() {
	this.busy(false);
	AccountTools.SetupWarnings(this, {
		'noUserName': {
			text: mf('register.warning.noUserName', 'Please enter a name for your new user.'),
			selectors: ['#registerName']
		},
		'noPassword': {
			text: mf('register.warning.noPasswordProvided', 'Please enter a password to register.'),
			selectors: ['#registerPassword']
		},
		'noCredentials': {
			text: mf('register.warning.noCredentials', 'Please enter a username and a password to register.'),
			selectors: ['#registerName', '#registerPassword']
		},
		'userExists': {
			text: mf('register.warning.userExists', 'This username already exists. Please choose another one.'),
			selectors: ['#registerName']
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
					instance.setWarning('noUserName');
				}

				if (reason == 'Password may not be empty') {
					instance.setWarning(!instance.$('#registerName').val()
						? 'noCredentials'
						: 'noPassword');
				}

				if (reason == 'Username already exists.') {
					instance.setWarning('userExists');
				}
			} else {
				$('#accountTasks').modal('hide');
				const regionId = cleanedRegion(Session.get('region'));
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
		instance.emailIsValid.set(AccountTools.IsEmail(email));
	},

	'submit'(event, instance) {
		event.preventDefault();
		instance.busy('requesting-pw-reset');
		Accounts.forgotPassword({
			email: instance.$('.js-reset-pw-email').val()
		}, function(err) {
			instance.busy(false);
			if (err) {
				showServerError('We were unable to send a mail to this address', err);
			} else {
				addMessage(mf('forgot.sent', "we sent a mail with instructions"), 'success');
				instance.parentInstance().accountTask.set('login');
			}
		});
	},

	'click .js-reset-pwd-close-btn'(event, instance) {
		instance.parentInstance().accountTask.set('login');
	},
});

Template.ownUserFrame.events({
	'click .js-logout'(event){
		event.preventDefault();
		Meteor.logout();

		const routeName = Router.current().route.getName();
		if (routeName === 'profile') Router.go('userprofile', Meteor.user());
	},

	'click .btn'() { $('.collapse').collapse('hide'); }
});

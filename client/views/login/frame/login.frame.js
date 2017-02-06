Template.userFrame.onCreated(function() {
	this.forgot = new ReactiveVar(false);
});

Template.userFrame.helpers({
	forgot: function() {
		return !Meteor.user() && Template.instance().forgot.get();
	},

	login: function() {
		return !Meteor.user() && !Template.instance().forgot.get();
	}
});

Template.loginFrame.onCreated(function() {
	var instance = this;

	instance.warnings = {
		noUserName:
			{ text: mf('login.warning.noUserName', 'Please enter your username or email to log in.')
			, selectors: ['#loginName']
			}
		,
		noCredentials:
			{ text: mf('login.login.warning', 'Please enter your username or email and password to log in.')
			, selectors: ['#loginName', '#loginPassword']
			}
		,
		noPassword:
			{ text: mf('login.password.password_incorrect', 'Incorrect password')
			, selectors: ['#loginPassword']
			}
		,
		userNotFound:
			{ text: mf('login.username.usr_doesnt_exist', 'This user does not exist.')
			, selectors: ['#loginName']
			}
	};

	instance.activeWarning = new ReactiveVar(false);
});

Template.loginFrame.onRendered(function() {
	var instance = this;

	function resetWarnings() {
		instance.$('.form-group').removeClass('has-error');
		instance.$('.help-block').remove();
	}

	instance.autorun(function() {
		var activeWarning = instance.activeWarning.get();
		if (activeWarning) {
			resetWarnings();
			var selectors = activeWarning.selectors;
			_.each(selectors, function(selector, index) {
				var formGroup = $(selector).parents('.form-group');
				formGroup.addClass('has-error');

				if (index === selectors.length -1) {
					formGroup.append(
						'<span class="help-block">'
						+ activeWarning.text
						+ '</span>'
					);
				}
			});
		} else {
			resetWarnings();
		}
	});

	$('.login-link').on('hide.bs.dropdown', function() {
		resetWarnings();
	});
});

Template.loginFrame.events({
	'click .js-forgot-pwd-btn': function(event, instance) {
		instance.parentInstance().forgot.set(true);
		return false;
	},

	'click .js-register-open': function(event, instance) {
		var name = instance.$('#loginName').val();
		var password = instance.$('#loginPassword').val();
		var email;

		// Sometimes people register with their email address in the first field
		// Move entered username over to email field if it contains a @
		if (~name.indexOf('@')) {
			email = name;
			name = '';
		}

		$('#registerName').val(name);
		$('#registerPassword').val(password);
		$('#registerEmail').val(email);
	},

	'submit form, click .js-login': function(event, instance){
		event.preventDefault();
		var user = instance.$('#loginName').val();
		var password = instance.$('#loginPassword').val();
		Meteor.loginWithPassword(user, password, function(err) {
			if (err) {
				var activeWarning = instance.activeWarning;
				var warnings = instance.warnings;
				var reason = err.reason;

				if (reason == 'Match failed') {
					var noPassword = !instance.$('#loginPassword').val();
					activeWarning.set(noPassword
					                  ? warnings.noCredentials
								      : warnings.noUserName);
				}

				if (reason == 'Incorrect password') {
					activeWarning.set(warnings.noPassword);
				}

				if (reason == 'User not found') {
					activeWarning.set(warnings.userNotFound);
				}
			} else {
				$('.loginButton').dropdown('toggle');
			}
		});
	},

	'click .js-external-service-login-btn': function(event, instance) {
		event.preventDefault();

		var loginMethod = 'loginWith' + event.currentTarget.dataset.service;
		if (!Meteor[loginMethod]) {
			console.log("don't have "+loginMethod);
			return;
		}
		Meteor[loginMethod]({
		}, function (err) {				// console.log(err.reason);

			if (err) {
				addMessage(err.reason || 'Unknown error', 'danger');
			} else {
				$('.loginButton').dropdown('toggle');
			}
		});
	}
});

Template.registerFrame.onCreated(function() {
	var instance = this;

	instance.warnings = {
		noUserName:
			{ text: mf('register.warning.noUserName', 'Please enter a name for your new user.')
			, selectors: ['#registerName']
			}
		,
		noPassword:
			{ text: mf('register.warning.noPasswordProvided', 'Please enter a password to register.')
			, selectors: ['#registerPassword']
			}
		,
		noCredentials:
			{ text: mf('register.warning.noCredentials', 'Please enter a username and a password to register.')
			, selectors: ['#registerName', '#registerPassword']
			}
		,
		userExists:
			{ text: mf('register.warning.userExists', 'This username already exists. Please choose another one.')
			, selectors: ['#registerName']
			}
	};

	instance.activeWarning = new ReactiveVar(false);
});

Template.registerFrame.onRendered(function() {
	var instance = this;

	function resetWarnings() {
		instance.$('.form-group').removeClass('has-error');
		instance.$('.help-block').remove();
	}

	instance.autorun(function() {
		var activeWarning = instance.activeWarning.get();
		if (activeWarning) {
			resetWarnings();
			var selectors = activeWarning.selectors;
			_.each(selectors, function(selector, index) {
				var formGroup = $(selector).parents('.form-group');
				formGroup.addClass('has-error');

				if (index === selectors.length -1) {
					formGroup.append(
						'<span class="help-block">'
						+ activeWarning.text
						+ '</span>'
					);
				}
			});
		} else {
			resetWarnings();
		}
	});

	$('#registerFrame').on('hide.bs.modal', function() {
		resetWarnings();
	});
});

Template.registerFrame.events({
	'click .js-register': function(event, instance) {
		event.preventDefault();

		var name = instance.$('#registerName').val();
		var password = instance.$('#registerPassword').val();
		var email = instance.$('#registerEmail').val();

		Accounts.createUser({
			username: name,
			password: password,
			email: email
		}, function (err) {
			if (err) {
				var activeWarning = instance.activeWarning;
				var warnings = instance.warnings;
				var reason = err.reason;

				if (reason == 'Need to set a username or email') {
					activeWarning.set(warnings.noUserName);
				}

				if (reason == 'Password may not be empty') {
					var noName = !instance.$('#registerName').val();
					activeWarning.set(noName
					                  ? warnings.noCredentials
									  : warnings.noPassword);
				}

				if (reason == 'Username already exists.') {
					activeWarning.set(warnings.userExists);
				}
			} else {
				$('#registerFrame').modal('hide');
				var regionId = cleanedRegion(Session.get('region'));
				if (regionId) {
					Meteor.call('user.regionChange', regionId);
				}
			}
		});
	}
});

Template.forgotPwdFrame.onCreated(function() {
	this.emailIsValid = new ReactiveVar(false);
});

Template.forgotPwdFrame.helpers({
	noValidEmail: function() {
		return !Template.instance().emailIsValid.get();
	}
});

Template.forgotPwdFrame.events({
	'keyup #resetPwdEmail': function(event, instance) {
		var resetPwdEmail = $(event.currentTarget).val();
		var emailIsValid = ~resetPwdEmail.indexOf('@');

		instance.emailIsValid.set(emailIsValid);
	},

	'submit .js-reset-pw': function(event, instance) {
		event.preventDefault();
		Accounts.forgotPassword({
			email: instance.$('.js-login-email').val()
		}, function(err) {
			if (err) {
				showServerError('We were unable to send a mail to this address', err);
			} else {
				addMessage(mf('forgot.sent', "we sent a mail with instructions"), 'success');
				instance.forgot.set(false);
			}
		});
		return false;
	},

	'click .js-reset-pwd-close-btn': function(event, instance) {
		instance.parentInstance().forgot.set(false);
		return false;
	},
});

Template.ownUserFrame.events({
	'click .js-logout': function(event){
		event.preventDefault();
		Meteor.logout();

		var routeName = Router.current().route.getName();
		if (routeName === 'profile') Router.go('userprofile', Meteor.user());
		return false;
	},
});

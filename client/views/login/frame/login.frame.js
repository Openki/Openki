/** Setup (re-)setting of login/register warnings for a template
  *
  * @param {Object} template
  * @param {Array}  warnings - an array containing objects obtaining the different
  *                            warning messages, depending on the type of error
  */
var warnings = function(template, warnings) {
	template.onCreated(function() {
		var instance = this;
		instance.hasWarning = new ReactiveVar(false);

		instance.resetWarnings = function() {
			instance.$('.form-group').removeClass('has-error');
			instance.$('.warning-block').remove();
		};

		instance.setWarning = function(name) {
			if (instance.hasWarning.get()) instance.resetWarnings();

			var warning = _.findWhere(warnings, { name: name });
			var selectors = warning.selectors;

			_.each(selectors, function(selector, index) {
				var formGroup = $(selector).parents('.form-group');

				formGroup.addClass('has-error');
				if (index === selectors.length - 1) {
					formGroup.append(
						'<span class="help-block warning-block">'
						+ warning.text
						+ '</span>'
					);
				}
			});

			instance.hasWarning.set(true);
		};
	});
};

/** Check a string if it is a valid email adress
  *
  * @param {String} the string to be checked
  */
var isEmail = function(str) {
	// consider string as valid email if it matches this pattern:
	// (1+ characters)@(1+ characters).(1+ characters)
	return str.search(/^[^@\s]+@[^@.\s]+\.\w+$/g) >= 0;
};

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

warnings(Template.loginFrame,
	[
		{ name: 'noUserName'
		, text: mf('login.warning.noUserName', 'Please enter your username or email to log in.')
		, selectors: ['#loginName']
		}
	,
		{ name: 'noCredentials'
		, text: mf('login.login.warning', 'Please enter your username or email and password to log in.')
		, selectors: ['#loginName', '#loginPassword']
		}
	,
		{ name: 'noPassword'
		, text: mf('login.password.password_incorrect', 'Incorrect password')
		, selectors: ['#loginPassword']
		}
	,
		{ name: 'userNotFound'
		, text: mf('login.username.usr_doesnt_exist', 'This user does not exist.')
		, selectors: ['#loginName']
		}
	]
);

Template.loginFrame.onCreated(function() {
	this.busy(false);
	this.OAuthServices =
		[
			{ 'name': 'google-plus'
			, 'fullName': 'Google+'
			, 'serviceName': 'Google'
			}
		,
			{ 'name': 'facebook'
			, 'fullName': 'Facebook'
			, 'serviceName': 'Facebook'
			}
		,
			{ 'name': 'github'
			, 'fullName': 'GitHub'
			, 'serviceName': 'Github'
			}
		];

	this.closeMenu = function() {
		if (Session.get('viewportWidth') <= SCSSVars.gridFloatBreakpoint) {
			$('.collapse').collapse('hide');
		} else {
			$('.loginButton').dropdown('toggle');
		}
	};
});

Template.loginFrame.onRendered(function() {
	var loginEmail = this.parentInstance().loginEmail;
	if (loginEmail) this.$('#loginName').val(loginEmail);
});

Template.loginFrame.events({
	'click .js-forgot-pwd-btn': function(event, instance) {
		event.preventDefault();
		var parentInstance = instance.parentInstance();
		var username = instance.$('#loginName').val();

		if (isEmail(username)) parentInstance.loginEmail = username;
		parentInstance.forgot.set(true);
	},

	'click .js-register-open': function(event, instance) {
		var username = instance.$('#loginName').val();
		var password = instance.$('#loginPassword').val();
		var email;

		// Sometimes people register with their email address in the first field
		// Move entered username over to email field if it contains a @
		if (isEmail(username)) {
			email = username;
			username = email.substr(0, email.indexOf('@'));
		}

		$('#registerName').val(username);
		$('#registerPassword').val(password);
		$('#registerEmail').val(email);
	},

	'submit form, click .js-login': function(event, instance){
		event.preventDefault();
		var user = instance.$('#loginName').val();
		var password = instance.$('#loginPassword').val();

		instance.busy('logging-in');
		Meteor.loginWithPassword(user, password, function(err) {
			instance.busy(false);
			if (err) {
				var reason = err.reason;
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
				instance.closeMenu();
			}
		});
	},

	'click .js-oauth-btn': function(event, instance) {
		event.preventDefault();

		var service = event.currentTarget.dataset.service;
		var loginMethod = 'loginWith' + service;
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
				instance.closeMenu();
			}
		});
	}
});

Template.loginFrame.helpers({
	OAuthServices: function() {
		return Template.instance().OAuthServices;
	}
});

Template.registerModal.events({
	'click .js-close': function(event, instance){
		instance.$('#registerFrame').modal('hide');
	}
});

warnings(Template.registerFrame,
	[
		{ name: 'noUserName'
		, text: mf('register.warning.noUserName', 'Please enter a name for your new user.')
		, selectors: ['#registerName']
		}
	,
		{ name: 'noPassword'
		, text: mf('register.warning.noPasswordProvided', 'Please enter a password to register.')
		, selectors: ['#registerPassword']
		}
	,
		{ name: 'noCredentials'
		, text: mf('register.warning.noCredentials', 'Please enter a username and a password to register.')
		, selectors: ['#registerName', '#registerPassword']
		}
	,
		{ name: 'userExists'
		, text: mf('register.warning.userExists', 'This username already exists. Please choose another one.')
		, selectors: ['#registerName']
		}
	]
);

Template.registerFrame.onCreated(function() {
	this.busy(false);
});

Template.registerFrame.onRendered(function() {
	var instance = this;

	$('#registerFrame').on('hide.bs.modal', function() {
		instance.resetWarnings();
	});
});

Template.registerFrame.events({
	'click .js-register': function(event, instance) {
		event.preventDefault();

		var name = instance.$('#registerName').val();
		var password = instance.$('#registerPassword').val();
		var email = instance.$('#registerEmail').val();

		instance.busy('registering');
		Accounts.createUser({
			username: name,
			password: password,
			email: email
		}, function (err) {
			instance.busy(false);
			if (err) {
				var reason = err.reason;
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
	this.busy(false);
	this.emailIsValid = new ReactiveVar(false);
});

Template.forgotPwdFrame.onRendered(function() {
	var loginEmail = this.parentInstance().loginEmail;
	if (loginEmail) {
		this.$('.js-reset-pw-email').val(loginEmail);
		this.emailIsValid.set(true);
	}
});

Template.forgotPwdFrame.helpers({
	noValidEmail: function() {
		return !Template.instance().emailIsValid.get();
	}
});

Template.forgotPwdFrame.events({
	'input, change, paste, keyup, mouseup': function(event, instance) {
		var email = instance.$('.js-reset-pw-email').val();
		instance.emailIsValid.set(isEmail(email));
	},

	'submit': function(event, instance) {
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

	'click .btn': function() {
		$('.collapse').collapse('hide');
	}
});

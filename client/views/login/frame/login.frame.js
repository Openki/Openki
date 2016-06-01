Template.userFrame.created = function() {
	this.forgot = new ReactiveVar(false);
};

Template.userFrame.events({
	'click .js-logout-btn': function(event){
		event.preventDefault();
		Meteor.logout();
	},

	'click .js-forgot-pwd-btn': function(event, instance) {
		instance.forgot.set(true);
		return false;
	},

	'click .js-reset-pwd-btn': function(event, instance) {
		Accounts.forgotPassword({
			email: instance.$('.js-login-email').val()
		}, function(err) {
			if (err) {
				addMessage(mf('forgot.failedSending', "We were unable to send a mail to this address!"), 'danger');
			} else {
				addMessage(mf('forgot.sent', "we sent a mail with instructions"), 'success');
				instance.forgot.set(false);
			}
		});
	},

	'click .js-reset-pwd-close-btn': function(event, instance) {
		instance.forgot.set(false);
		return false;
	},

	'click .user-frame': function(event, instance) {
		event.stopPropagation();
	}
});

Template.userFrame.helpers({
	username: function() {
		return Meteor.user() && Meteor.user().username;
	},

	forgot: function() {
		return !Meteor.user() && Template.instance().forgot.get();
	},

	login: function() {
		return !Meteor.user() && !Template.instance().forgot.get();
	},
});


Template.forgotPwdFrame.onCreated(function() {
	this.loginEmail = new ReactiveVar("");
});


var validEmail = function() {
	var candidate = Template.instance().loginEmail.get();
	var atPos = candidate.indexOf('@');
	return atPos > 0 && atPos < candidate.length - 1;
};


Template.forgotPwdFrame.helpers({
	validEmail: validEmail,

	disableForInvalidEmail: function() {
		return validEmail() ? '' : 'disabled';
	}
});


Template.forgotPwdFrame.events({
	'change .js-login-email, keyup .js-login-email': function(event, instance) {
		instance.loginEmail.set("" + instance.$('.js-login-email').val());
	},
});



Template.loginFrame.onRendered(function() {
	var instance = this;
	var dropdownElm = $(".login-dropdown").parent();
	dropdownElm.on("shown.bs.dropdown", function() {
		$('.js-login-name').focus();
	});
	instance.closeDropdown = function() {
		dropdownElm.find("[data-toggle='dropdown']").dropdown('toggle');
	};
});


Template.loginFrame.created = function() {
	this.registering = new ReactiveVar(false);
	this.transEmail = ''; // Temp storage for email addresses enterd into the user name field
};


Template.loginFrame.helpers({
	registering: function() {
		return Template.instance().registering.get();
	},

	showForgot: function() {
		return !Template.instance().registering.get();
	},

	showEmail: function() {
		var instance = Template.instance();
		return instance.registering.get();
	},

	transEmail: function() {
		return Template.instance().transEmail;
	},

	validEmail: validEmail,

	disableForInvalidEmail: function() {
		return validEmail() ? '' : 'disabled';
	},

	loginUsernamePlaceholder: function() {
		return Template.instance().registering.get()
			? mf('frame.login.username', 'Username')
			: mf('frame.login.usernameOrEmail', 'Username or Email');
	},
});


Template.loginFrame.events({
	'click .js-register-btn': function(event, instance){
		event.preventDefault();

		var nameField =  instance.$('.js-login-name');
		var name = nameField.val();

		if (instance.registering.get()) {
			var password = instance.find('.js-login-password').value;
			var email = instance.$('.js-login-email').val();
			Accounts.createUser({
				username: name,
				password: password,
				email: email
			}, function (err) {
				if (err) {
					if (err.error == 400) {
						$('#username_warning').hide(300);
						$('.user-frame').removeClass('username_warning');
						$('#password_warning').show(300);
						$('.user-frame').addClass('password_warning');
					} else {
						$('#username_warning').show(300);
						$('.user-frame').addClass('username_warning');
						$('#password_warning').hide(300);
						$('.user-frame').removeClass('password_warning');
					}
				} else {
					instance.closeDropdown();
				}
			});
		} else {
			$('#password_warning_incorrect').hide(300);
			$('#username_warning_not_existing').hide(300);
			$('#login_warning').hide(300);
			$('.user-frame').removeClass('username_warning');
			$('.user-frame').removeClass('password_warning');
			Template.instance().registering.set(true);

			// Sometimes people register with their email address in the first field
			// Move entered username over to email field if it contains a @
			var emailField = instance.$('.js-login-email');
			var atPos = name.indexOf('@');
			if (atPos > -1) {
				nameField.val(name.substr(0, atPos));
				instance.transEmail = name;
			}
		}
	},

	'submit form, click .js-login-btn': function(event, instance){
		event.preventDefault();
		if(Template.instance().registering.get()){
			$('#password_warning').hide(300);
			$('#username_warning').hide(300);
			$('.user-frame').removeClass('username_warning');
			$('.user-frame').removeClass('password_warning');
			Template.instance().registering.set(false);
			return;
		}
		var name = instance.find('.js-login-name').value;
		var password = instance.find('.js-login-password').value;
		Meteor.loginWithPassword(name, password, function(err) {
			if (err) {
				if (err.error == 400) {
					$('#password_warning_incorrect').hide(300);
					$('#username_warning_not_existing').hide(300);
					$('.user-frame').addClass('username_warning');
					$('.user-frame').addClass('password_warning');
					$('#login_warning').show(300);
				} else if (err.reason == 'Incorrect password') {
					$('#login_warning').hide(300);
					$('#username_warning_not_existing').hide(300);
					$('.user-frame').removeClass('username_warning');
					$('.user-frame').addClass('password_warning');
					$('#password_warning_incorrect').show(300);
				} else {
					$('#login_warning').hide(300);
					$('#password_warning_incorrect').hide(300);
					$('.user-frame').removeClass('password_warning');
					$('.user-frame').addClass('username_warning');
					$('#username_warning_not_existing').show(300);
				}
			} else {
				$('.user-frame').removeClass('username_warning');
				$('.user-frame').removeClass('password_warning');
				instance.closeDropdown();
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
		}, function (err) {
			if (err) {
				addMessage(err.reason || 'Unknown error', 'danger');
			} else {
				instance.closeDropdown();
			}
		});
	}
});

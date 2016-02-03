Template.loginFrame.created = function() {
	this.forgot = new ReactiveVar(false);
};

Template.loginFrame.events({
	'click .loginLogout': function(event){
		event.preventDefault();
		Meteor.logout();
	},

	'click .-forgot': function(event, instance) {
		instance.forgot.set(true);
		return false;
	},

	'click .-forgotSend': function(event, instance) {
		Accounts.forgotPassword({
			email: instance.$('.-loginEmail').val()
		}, function(err) {
			if (err) {
				addMessage(mf('forgot.failedSending', "We were unable to send a mail to this address!"), 'danger');
			} else {
				addMessage(mf('forgot.sent', "we sent a mail with instructions"), 'success');
				instance.forgot.set(false);
			}
		});
	},

	'click .-forgotClose': function(event, instance) {
		instance.forgot.set(false);
		return false;
	},
});

Template.loginFrame.helpers({
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


Template.loginForgot.onCreated(function() {
	this.loginEmail = new ReactiveVar("");
});


var validEmail = function() {
	var candidate = Template.instance().loginEmail.get();
	var atPos = candidate.indexOf('@');
	return atPos > 0 && atPos < candidate.length - 1;
};


Template.loginForgot.helpers({
	validEmail: validEmail,

	disableForInvalidEmail: function() {
		return validEmail() ? '' : 'disabled';
	}
});


Template.loginForgot.events({
	'change .-loginEmail, keyup .-loginEmail': function(event, instance) {
		instance.loginEmail.set("" + instance.$('.-loginEmail').val());
	},
});



Template.loginLogin.onRendered(function() {
	var instance = this;
	var dropdownElm = $(".login-dropdown").parent();
	dropdownElm.on("shown.bs.dropdown", function() {
		$('#login-name').focus();
	});
	instance.closeDropdown = function() {
		dropdownElm.find("[data-toggle='dropdown']").dropdown('toggle');
	};
});


Template.loginLogin.created = function() {
	this.registering = new ReactiveVar(false);
};


Template.loginLogin.helpers({
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

	validEmail: validEmail,

	disableForInvalidEmail: function() {
		return validEmail() ? '' : 'disabled';
	}
});


Template.loginLogin.events({
	'click .loginRegister': function(event, instance){
		event.preventDefault();
		if (instance.registering.get()) {
			var name = instance.find('#login-name').value;
			var password = instance.find('#login-password').value;
			var email = instance.$('.-loginEmail').val();
			Accounts.createUser({
				username: name,
				password: password,
				email: email
			}, function (err) {
				if (err) {
					if (err.error == 400) {
						$('#username_warning').hide(300);
						$('#login-name').removeClass('username_warning');
						$('#password_warning').show(300);
						$('#login-password').addClass('password_warning');
					} else {
						$('#password_warning').hide(300);
						$('#login-password').removeClass('password_warning');
						$('#username_warning').show(300);
						$('#login-name').addClass('username_warning');
					}
				} else {
					instance.closeDropdown();
				}
			});
		}
		else {
			$('#password_warning_incorrect').hide(300);
			$('#username_warning_not_existing').hide(300);
			$('#login_warning').hide(300);
			$('#login-name').removeClass('username_warning');
			$('#login-password').removeClass('password_warning');
			Template.instance().registering.set(true);
		}
	},

	'submit form, click .loginLogin': function(event, instance){
		event.preventDefault();
		if(Template.instance().registering.get()){
			$('#password_warning').hide(300);
			$('#username_warning').hide(300);
			$('#login-name').removeClass('username_warning');
			$('#login-password').removeClass('password_warning');
			Template.instance().registering.set(false);
			return;
		}
		var name = instance.find('#login-name').value;
		var password = instance.find('#login-password').value;
		Meteor.loginWithPassword(name, password, function(err) {
			if (err) {
				if (err.error == 400) {
					$('#password_warning_incorrect').hide(300);
					$('#username_warning_not_existing').hide(300);
					$('#login-name').addClass('username_warning');
					$('#login-password').addClass('password_warning');
					$('#login_warning').show(300);
				} else if (err.reason == 'Incorrect password') {
					$('#login_warning').hide(300);
					$('#username_warning_not_existing').hide(300);
					$('#login-name').removeClass('username_warning');
					$('#login-password').addClass('password_warning');
					$('#password_warning_incorrect').show(300);
				} else {
					$('#login_warning').hide(300);
					$('#password_warning_incorrect').hide(300);
					$('#login-password').removeClass('password_warning');
					$('#login-name').addClass('username_warning');
					$('#username_warning_not_existing').show(300);
				}
			} else {
				instance.closeDropdown();
			}
		});
	},

	'click .loginWithService': function(event, instance) {
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

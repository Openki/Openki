Router.map(function() {
	this.route('resetPassword', {
		path: "reset-password/:token",
		data: function () {
			return this.params.token;
		},
		onAfterAction: function() {
			document.title = mf('resetPassword.siteTitle', "Reset password");
		}
	})
});


Template.resetPassword.onCreated(function () {
	var instance = this;
	instance.password = new ReactiveVar("");
	instance.passwordValid = new ReactiveVar(false);
	instance.passwordSame = new ReactiveVar(false);
	instance.passwordNotSame = new ReactiveVar(false);
	instance.showPassword = new ReactiveVar(false);

	instance.updatePassword = function() {
		var password = $('.-resetPassword').val();
		instance.password.set(password);

		if (instance.showPassword.get()) {
			instance.passwordValid.set(password.length > 0);
		} else {
			var passwordConfirm = $('.-resetPasswordConfirm').val();
			instance.passwordSame.set(password.length > 0 && password === passwordConfirm);
			instance.passwordNotSame.set(passwordConfirm && password.length <= passwordConfirm.length && password !== passwordConfirm);
			instance.passwordValid.set(password.length > 0 && password === passwordConfirm);
		}
	};
});


Template.resetPassword.helpers({
	'showPassword': function(action) {
		return Template.instance().showPassword.get();
	},

	'passwordSame': function(action) {
		return Template.instance().passwordSame.get();
	},

	'passwordNotSame': function(action) {
		return Template.instance().passwordNotSame.get();
	},

	'passwordFieldType': function(action) {
		return Template.instance().showPassword.get() ? "text" : "password";
	},

	'showButtonClass': function(action) {
		var showPassword = Template.instance().showPassword.get();
		var active = action == 'show' ? showPassword : !showPassword;
		return "btn btn-secondary -" + action + "Password " + (active ? 'active' : '');
	},

	'submitDisabled': function() {
		return Template.instance().passwordValid.get() ? '' : 'disabled';
	}
});

Template.resetPassword.events({
	'click .-showPassword': function(event, instance) {
		instance.showPassword.set(true);
		instance.updatePassword();
	},

	'click .-hidePassword': function(event, instance) {
		instance.showPassword.set(false);
		instance.updatePassword();
	},

	'keyup': function(event, instance) {
		instance.updatePassword();
	},

	'blur': function(event, instance) {
		instance.updatePassword();
	},

	'submit': function(event, instance) {
		event.preventDefault();

        var password = instance.$('.-resetPassword').val();
		var token = Template.instance().data;
		Accounts.resetPassword(token, password, function(err) {
			if (err) {
				addMessage(mf('resetPassword.errorMessage', { ERROR: err }, 'Unable to reset password: {ERROR}'), 'danger');
			} else {
				addMessage(mf('resetPassword.successMessage', 'Reset your password'), 'success');
				Router.go('profile');
			}
		});
    },

	'click .-resetPasswordAbort': function() {
		Router.go('/');
	}
});

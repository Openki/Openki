Template.loginFrame.events({
	'click .loginLogout': function(event){
		event.preventDefault();
		Meteor.logout();
	},
});


Template.loginFrame.helpers({
    username: function () {
      return Meteor.user() && Meteor.user().username;
    },
});

Template.loginLogin.helpers({
	registering: function () {
		return Template.instance().registering.get();
	},
});

Template.loginLogin.created = function() {
	this.registering = new ReactiveVar(false);
}

Template.loginLogin.events({
	'click .loginRegister': function(event, template){
		event.preventDefault();
		if(Template.instance().registering.get()){
			var name = template.find('#login-name').value;
			var password = template.find('#login-password').value;
			var email = template.find('#login-email').value;
			Accounts.createUser({
				username: name,
				password: password,
				email: email
			}, function (err) {
				if (err) {
<<<<<<< HEAD
					addMessage(err, 'danger');
=======
					console.log(err)
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
>>>>>>> 38c65d84ffe2bdc4c54d0507776a3f7ca71387b7
				} else {
					$('.dropdown.open').removeClass('open');
				}
			});
		}
		else {
			$('#password_warning_incorrect').hide(300);
			$('#username_warning_not_existing').hide(300);
			$('#login_warning').hide(300);
			$('#login-name').removeClass('username_warning');
			$('#login-password').removeClass('password_warning');
			$('#show_email').show(300);
			Template.instance().registering.set(true);
		}
	},

	'submit form, click .loginLogin': function(event, template){
		event.preventDefault();
		if(Template.instance().registering.get()){
			$('#show_email').hide(300);
			$('#password_warning').hide(300);
			$('#username_warning').hide(300);
			$('#login-name').removeClass('username_warning');
			$('#login-password').removeClass('password_warning');
			Template.instance().registering.set(false);
			return;
		}
		var name = template.find('#login-name').value;
		var password = template.find('#login-password').value;
		Meteor.loginWithPassword(name, password, function(err) {
			if (err) {
<<<<<<< HEAD
				addMessage(err, 'danger');
=======
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
>>>>>>> 38c65d84ffe2bdc4c54d0507776a3f7ca71387b7
			} else {
				$('.dropdown.open').removeClass('open');
			}
		});
	},
	'click .loginWithService': function(event) {
		console.log('123')
		var loginMethod = 'loginWith' + event.currentTarget.dataset.service;
		console.log(loginMethod)
		if (!Meteor[loginMethod]) {
			console.log("don't have "+loginMethod);
			return;
		}
		Meteor[loginMethod]({
		}, function (err) {
			if (err) {
				addMessage(err.reason || 'Unknown error', 'danger');
			} else {
				$('.dropdown.open').removeClass('open');
			}
		});
	}
});

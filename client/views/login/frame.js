Template.loginFrame.helpers({
	'showLoginFrame': function() {
		return Session.get('showLogin');
	}
})


Template.loginFrame.events({
	'click .loginClose': function() {
		Session.set('showLogin', false);
	},
	'click .loginLogout': function(event){
		event.preventDefault();
		Meteor.logout();
		Session.set('showLogin', false);
	}
})


Template.loginRegister.events({
	'submit form': function(event, template){
		event.preventDefault();
		var emailVar = template.find('#register-email').value;
		var passwordVar = template.find('#register-password').value;
		Accounts.createUser({
			email: emailVar,
			password: passwordVar
		});
		
		Session.set('showLogin', false);
	}
});

 
Template.loginLogin.events({
	'submit form': function(event, template){
		event.preventDefault();
		var email = template.find('#login-email').value;
		var password = template.find('#login-password').value;
		Meteor.loginWithPassword(email, password, function(err) {
			if (err) {
				console.log(err);
			} else {
				Session.set('showLogin', false);
			}
		});
		
	},
	'click .loginWithGithub': function(event){
		event.preventDefault();
		Meteor.loginWithGithub({
		}, function (err) {
			if (err) {
				addMessage(err.reason || 'Unknown error');
			}
		});
		Session.set('showLogin', false);
	}
});

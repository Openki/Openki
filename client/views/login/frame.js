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
		var name = template.find('#register-name').value;
		var password = template.find('#register-password').value;
		Accounts.createUser({
			username: name,
			password: password
		});
		
		Session.set('showLogin', false);
	}
});

 
Template.loginLogin.events({
	'submit form': function(event, template){
		event.preventDefault();
		var name = template.find('#login-name').value;
		var password = template.find('#login-password').value;
		Meteor.loginWithPassword(name, password, function(err) {
			if (err) {
				console.log(err);
			} else {
				Session.set('showLogin', false);
			}
		});
		
	},
	'click .loginWithService': function(event) {
		var loginMethod = 'loginWith' + event.currentTarget.dataset.service;
		if (!Meteor[loginMethod]) {
			console.log("don't have "+loginMethod);
			return;
		}
		Meteor['loginWith'+event.currentTarget.dataset.service]({
		}, function (err) {
			if (err) {
				addMessage(err.reason || 'Unknown error');
			}
		});
		Session.set('showLogin', false);
	}
});

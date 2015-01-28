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
});


Template.loginFrame.helpers({
  username: function () {
    return Meteor.user() && Meteor.user().username;
  }
});

 
Template.loginLogin.events({
	'click .loginRegister': function(event, template){
		event.preventDefault();
		var name = template.find('#login-name').value;
		var password = template.find('#login-password').value;
		console.log(name)
		Accounts.createUser({
			username: name,
			password: password
		}, function(err) {
			if (err) {
				addMessage(err);
			} else {
				Session.set('showLogin', false);
			}
		});
	},
	'submit form, click .loginLogin': function(event, template){
		event.preventDefault();
		var name = template.find('#login-name').value;
		var password = template.find('#login-password').value;
		Meteor.loginWithPassword(name, password, function(err) {
			if (err) {
				addMessage(err);
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
			} else {
				Session.set('showLogin', false);
			}
		});
	}
});

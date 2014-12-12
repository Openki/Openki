Template.loginButton.helpers({
	'loginServicesConfigured': function() {
		return Accounts.loginServicesConfigured();
	}
});

Template.loginButton.events({
	'click .loginButton': function() {
		Session.set('showLogin', !Session.get('showLogin'));
	}
});

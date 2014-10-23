Template.loginFrame.helpers({
	'showLoginFrame': function() {
		return Session.get('showLogin');
	}
})

Template.loginFrame.events({
	'click .loginClose': function() {
		Session.set('showLogin', false);
	}
})
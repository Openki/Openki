Template.loginButton.helpers({
	'loginServicesConfigured': function() {
		return Accounts.loginServicesConfigured();
	}
});

Template.loginButton.events({
	'click #openLogin'() {
		$('#accountTasks').modal('show');
	}
})

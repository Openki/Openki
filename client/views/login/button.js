Template.loginButton.events({
	'click .loginButton': function() {
		Session.set('showLogin', true);
	}
});

Template.loginButton.helpers({
  username: function () {
    return Meteor.user() && Meteor.user().username;
  }
});

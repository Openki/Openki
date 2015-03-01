Template.loginFrame.events({
	'click .loginLogout': function(event){
		event.preventDefault();
		Meteor.logout();
	},
});


Template.loginFrame.helpers({
  username: function () {
    return Meteor.user() && Meteor.user().username;
  }
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
			}, function(err) {
				if (err) {
					addMessage(err);
				} else {
					Session.set('showLogin', false);
				}
			});
		}
		else {
			$('#show_email').show(300);
			Template.instance().registering.set(true);
		}
	},

	'submit form, click .loginLogin': function(event, template){
		event.preventDefault();
		if(Template.instance().registering.get()){
			$('#show_email').hide(300);
			Template.instance().registering.set(false);
			return;
		}
		var name = template.find('#login-name').value;
		var password = template.find('#login-password').value;
		Meteor.loginWithPassword(name, password, function(err) {
			if (err) {
				addMessage(err);
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
				addMessage(err.reason || 'Unknown error');
			} else {
				$('.dropdown.open').removeClass('open');
			}
		});
	}
});

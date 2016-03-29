Router.map(function () {
	this.route('profile', {
		path: 'profile',
		waitOn: function () {
			return [
				Meteor.subscribe('currentUser'),
				Meteor.subscribe('coursesFind', { userInvolved: Meteor.userId() }),
				Meteor.subscribe('groupsFind', { own: true })
			];
		},
		data: function () {
			var user = Meteor.user();
			if(user) {
				var userdata = {
					_id: user._id,
					name: user.username,
					privacy: user.privacy,
					groups: GroupLib.find({ own: true }),
				};
				userdata.have_email = user.emails && user.emails.length > 0;
				if (userdata.have_email) {
					userdata.email = user.emails[0].address;
					if(user.emails[0].verified){
						userdata.verifiedEmail = 'verified';
						userdata.verifiedEmailTrue = '1';
					}
					else userdata.verifiedEmail = 'not verified';
				}

				return {
					user: userdata,
					courses: coursesFind({ userInvolved: user._id })
				};
			}
		},
		onAfterAction: function() {
			var user = Meteor.users.findOne();
			if (!user) return;
			document.title = webpagename + 'My Profile_Settings - ' + user.username;
		}
	});
});

Template.profile.created = function() {
	this.editing = new ReactiveVar(false);
	this.changingPass = new ReactiveVar(false);
};

Template.profile.helpers({
	editing: function() {
		return Template.instance().editing.get();
	},
	changingPass: function() {
		return Template.instance().changingPass.get();
	},
	verifyDelete: function() {
		return Session.get('verify') === 'delete';
	},

	groupCount: function() {
		return this.user.groups.count();
	}
});

Template.profile.events({
	'click button.edit': function() {
		Template.instance().editing.set(true);
	},
	'click button.editCancel': function() {
		Template.instance().editing.set(false);
		return false;
	},
	'click button.changePass': function() {
		Template.instance().changingPass.set(true);
	},
	'click button.changePassCancel': function() {
		Template.instance().changingPass.set(false);
		return false;
	},
	'click button.delete': function () {
		Session.set('verify', 'delete');
	},
	'click button.confirmdelete': function () {
		Meteor.call('delete_profile', function() {
			addMessage(mf('profile.deleted', 'Your account has been deleted'), 'success');
		});
		Session.set('verify', false);
	},
	'click .verifycancel': function () {
		Session.set('verify', false);
	},
	'submit .edit': function(event) {
		event.preventDefault();
		var template = Template.instance();
		Meteor.call('update_userdata',
			document.getElementById('editform_username').value,
			document.getElementById('editform_email').value,
			document.getElementById('privacy').checked,
			function(err) {
				if (err) {
					addMessage(mf('profile.savingError', { ERROR: err }, 'Saving your profile failed: {ERROR}'), 'danger');
				} else {
					addMessage(mf('profile.updated', 'Updated profile'), 'success');
					template.editing.set(false);
				}
			}
		);
	},
	'submit .passChange': function(event) {
		event.preventDefault();
		var template = Template.instance();
		var old = document.getElementById('oldpassword').value;
		var pass = document.getElementById('newpassword').value;
		if (pass !== "") {
			if (pass !== document.getElementById('newpassword_confirm').value) {
				addMessage(mf('profile.passwordMismatch', "Sorry, Your new passwords don't match"), 'danger');
				return;
			} else {
				var minLength = 5; // We've got _some_ standards
				if (pass.length < minLength) {
					addMessage(mf('profile.passwordShort', 'Are you serious? Your desired password is too short, sorry.'), 'danger');
					return;
				}
				Accounts.changePassword(old, pass, function(err) {
					if (err) {
						addMessage(mf('profile.passwordChangeFailed', 'Failed to change your password'), 'danger');
					} else {
						addMessage(mf('profile.passwordChangedSuccess', 'You have changed your password successfully.'), 'success');
						template.changingPass.set(false);
					}
				});
			}
		}
	},
	'click button.verify': function () {
		Meteor.call('sendVerificationEmail');
	}
});

Template.profile.rendered = function() {
	var currentPath = Router.current().route.path(this);
	$('a[href!="' + currentPath + '"].nav_link').removeClass('active');
	$('a.loginButton.nav_link').addClass('active');
};

Router.map(function () {
	this.route('profile', {
		path: 'profile',
		waitOn: function () {
			return [ 
				Meteor.subscribe('currentUser'),
				Meteor.subscribe('coursesFind', 'all', false, { userInvolved: Meteor.userId() }),
				Meteor.subscribe('groups')
			];
		},
		data: function () {
			var user = Meteor.user()
			if(user) {
				var userdata = {
					_id: user._id,
					name: user.username,
					privacy: user.privacy,
					groups: !!user.groups && Groups.find({_id: {$in: user.groups}}).map(function(grp) { return grp.name }).join(', '),
					groupcount: user.groups && user.groups.length || 0
				}
				userdata.have_email = user.emails && user.emails.length > 0;
				if (userdata.have_email) {
					userdata.email = user.emails[0].address
					if(user.emails[0].verified){
						userdata.verifiedEmail = 'verified'
						userdata.veryfiedEmailTrue = '1'
					}
					else userdata.verifiedEmail = 'not verified'
				}
				
				return { 
					user: userdata,
					courses: coursesFind('all', false, { userInvolved: user._id })
				};
			}
		},
		onAfterAction: function() {
			var user = Meteor.users.findOne()
			if (!user) return;
			document.title = webpagename + 'My Profile_Settings - ' + user.username;
		}
	})
});

Template.profile.created = function() {
	this.editing = new ReactiveVar(false);
	this.changingPass = new ReactiveVar(false);
}

Template.profile.helpers({
	editing: function() {
		return Template.instance().editing.get();
	},
	changingPass: function() {
		return Template.instance().changingPass.get();
	},
	verifyDelete: function() {
		return Session.get('verify') === 'delete';
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
			addMessage(mf('profile.deleted', 'Your account has been deleted'));
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
				if (!err) {
					addMessage(mf('profile.updated', 'Updated profile'));
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
		if (pass != "") {
			if (pass !== document.getElementById('newpassword_confirm').value) {
				addMessage(mf('profile.passwordMismatch', 'Passwords don\'t match'));
				return;
			} else {
				var minLength = 5; // We've got _some_ standards
				if (pass.length < minLength) {
					addMessage(mf('profile.passwordShort', 'Your desired password is too short'));
					return;
				}
				Accounts.changePassword(old, pass, function(err) {
					if (err) {
						addMessage(mf('profile.passwordChangeFailed', 'Failed to change your password'));
					} else {
						addMessage(mf('profile.passwordChanged', 'changed password'));
						template.changingPass.set(false);
					}
				});
			}
		}
	},
	'click button.verify': function () {
		Meteor.call('sendVerificationEmail')
	}
});

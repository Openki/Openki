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
					involvedIn: coursesFind({ userInvolved: user._id })
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
	},

	privacyChecked: function() {
		if (this.user.privacy) return 'checked';
	},

	hasInvolvedIn: function() {
		return this.involvedIn.count() > 0;
	}
});

Template.profile.events({
	'click .js-profile-info-edit-btn': function(event, template) {
		Tooltips.hide();
		Template.instance().editing.set(true);
	},

	'click .js-profile-info-cancel-btn': function() {
		Template.instance().editing.set(false);
		return false;
	},

	'click .js-change-pwd-btn': function() {
		Template.instance().changingPass.set(true);
	},

	'click .js-change-pwd-cancel-btn': function() {
		Template.instance().changingPass.set(false);
		return false;
	},

	'click .js-profile-delete-btn': function (event, template) {
		Session.set('verify', 'delete');
	},

	'click .js-profile-delete-confirm-btn': function () {
		Meteor.call('delete_profile', function() {
			addMessage(mf('profile.deleted', 'Your account has been deleted'), 'success');
		});
		Session.set('verify', false);
	},

	'click .js-profile-delete-cancel-btn': function () {
		Session.set('verify', false);
	},

	'submit .profile-info-edit': function(event) {
		event.preventDefault();
		var template = Template.instance();
		Meteor.call('update_userdata',
			document.getElementById('editform_username').value,
			document.getElementById('editform_email').value,
			document.getElementById('privacy').checked,
			function(err) {
				if (err) {
					showServerError('Saving your profile failed', err);
				} else {
					addMessage(mf('profile.updated', 'Updated profile'), 'success');
					template.editing.set(false);
				}
			}
		);
	},

	'submit #changePwd': function(event) {
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
						showServerError('Failed to change your password', err);
					} else {
						addMessage(mf('profile.passwordChangedSuccess', 'You have changed your password successfully.'), 'success');
						template.changingPass.set(false);
					}
				});
			}
		}
	},

	'click .js-verify-mail-btn': function () {
		Meteor.call('sendVerificationEmail');
	}
});

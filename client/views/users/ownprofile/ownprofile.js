// See routing.js for the route

Template.profile.created = function() {
	this.editing = new ReactiveVar(false);
	this.changingPass = new ReactiveVar(false);
	this.sending = new ReactiveVar(false);
};

Template.profile.helpers({
	editing: function() {
		return Template.instance().editing.get();
	},
	changingPass: function() {
		return Template.instance().changingPass.get();
	},

	sending: function() {
		return Template.instance().sending.get();
	},

	verifyDelete: function() {
		return Session.equals('verify', 'delete');
	},

	groupCount: function() {
		return this.user.groups.count();
	},

	notificationsChecked: function() {
		if (this.user.notifications) return 'checked';
	},

	privacyChecked: function() {
		if (this.user.privacy) return 'checked';
	},

	isVenueEditor: function() {
		return this.user.venues.count() > 0;
	},
	roles: function() {
		return _.clone(Roles).reverse();
	},
	coursesByRole: function(role) {
		var templateData = Template.instance().data;
		var involvedIn = templateData.involvedIn;
		var userID = templateData.user._id;
		var coursesForRole = [];

		involvedIn.forEach(function(course) {			
			if(!!hasRoleUser(course.members, role, userID)) {
				coursesForRole.push(course);
			}
		});
		return coursesForRole;
	},
	roleMyList: function() {
		return 'roles.'+this.type+'.myList';
	},
	unsubscribeSuccess: function() {
		return Router.current().params.query.unsubscribed === '';
	},
	unsubscribeError: function() {
		return Router.current().params.query['unsubscribe-error'] === '';
	}
});

Template.profile.events({
	'click .js-profile-info-edit': function(event, template) {
		Tooltips.hide();
		Template.instance().editing.set(true);
	},

	'click .js-profile-info-cancel': function() {
		Template.instance().editing.set(false);
		return false;
	},

	'click .js-change-pwd-btn': function() {
		Template.instance().changingPass.set(true);
	},

	'click .js-change-pwd-cancel': function() {
		Template.instance().changingPass.set(false);
		return false;
	},

	'click .js-profile-delete': function (event, template) {
		Session.set('verify', 'delete');
	},

	'click .js-profile-delete-confirm-btn': function () {
		Meteor.call('delete_profile', function() {
			addMessage(mf('profile.deleted', 'Your account has been deleted'), 'success');
		});
		Session.set('verify', false);
	},

	'click .js-profile-delete-cancel': function () {
		Session.set('verify', false);
	},

	'submit .profile-info-edit': function(event) {
		event.preventDefault();
		var template = Template.instance();
		Meteor.call('update_userdata',
			document.getElementById('editform_username').value,
			document.getElementById('editform_email').value,
			template.$('.js-notifications').prop("checked"),
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

	'click .js-verify-mail-btn': function (event, instance) {
		instance.sending.set(true);
		Meteor.call('sendVerificationEmail', function(err) {
			if (err) {
				instance.sending.set(false);
				showServerError('Failed to send verification mail', err);
			} else {
				addMessage(mf('profile.sentVerificationMail', 'A verification mail is on its way to your address.'), 'success');
			}
		});
	}
});

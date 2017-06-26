// See routing.js for the route

TemplateMixins.Expandible(Template.profile);
Template.profile.onCreated(function() {
	this.busy(false);
	this.editing = new ReactiveVar(false);
	this.changingPass = new ReactiveVar(false);
	this.verifyDelete = new ReactiveVar(false);
});

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
		return Template.instance().verifyDelete.get();
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
	'click .js-profile-info-edit': function(event, instance) {
		Tooltips.hide();
		instance.editing.set(true);
		instance.collapse();
	},

	'click .js-profile-info-cancel': function(event, instance) {
		instance.editing.set(false);
		return false;
	},

	'click .js-change-pwd-btn': function(event, instance) {
		instance.changingPass.set(true);
		instance.collapse();
	},

	'click .js-change-pwd-cancel': function(event, instance) {
		instance.changingPass.set(false);
	},

	'click .js-expand': function(event, instance) {
		instance.changingPass.set(false);
	},

	'click .js-profile-delete-confirm-btn': function(event, instance) {
		instance.busy('deleting');
		Meteor.call('delete_profile', function() {
			instance.busy(false);
			addMessage(mf('profile.deleted', 'Your account has been deleted'), 'success');
		});
		instance.collapse(); // Wait for server to log us out.
	},

	'submit .profile-info-edit': function(event, instance) {
		event.preventDefault();
		Meteor.call('update_userdata',
			document.getElementById('editform_username').value,
			document.getElementById('editform_email').value,
			instance.$('.js-notifications').prop("checked"),
			function(err) {
				if (err) {
					showServerError('Saving your profile failed', err);
				} else {
					addMessage(mf('profile.updated', 'Updated profile'), 'success');
					instance.editing.set(false);
				}
			}
		);
	},

	'submit #changePwd': function(event, instance) {
		event.preventDefault();
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
						instance.changingPass.set(false);
					}
				});
			}
		}
	},
});

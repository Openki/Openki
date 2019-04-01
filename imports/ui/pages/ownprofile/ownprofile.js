import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';

import Roles from '/imports/api/roles/roles.js';

import TemplateMixins from '/imports/ui/lib/template-mixins.js';
import Alert from '/imports/api/alerts/alert.js';
import { HasRoleUser } from '/imports/utils/course-role-utils.js';

import '/imports/ui/components/buttons/buttons.js';
import '/imports/ui/components/groups/list/group-list.js';
import '/imports/ui/components/profiles/course-list/profile-course-list.js';
import '/imports/ui/components/profiles/verify-email/verify-email.js';
import '/imports/ui/components/venues/link/venue-link.js';

import './ownprofile.html';

TemplateMixins.Expandible(Template.profile);
Template.profile.onCreated(function() {
	this.busy(false);
	this.editing = new ReactiveVar(false);
	this.changingPass = new ReactiveVar(false);
	this.verifyDelete = new ReactiveVar(false);
});

Template.profile.helpers({
	editing() {
		return Template.instance().editing.get();
	},
	changingPass() {
		return Template.instance().changingPass.get();
	},

	sending() {
		return Template.instance().sending.get();
	},

	verifyDelete() {
		return Template.instance().verifyDelete.get();
	},

	groupCount() {
		return this.user.groups.count();
	},

	notificationsChecked() {
		if (this.user.notifications) return 'checked';
	},

	privacyChecked() {
		if (this.user.privacy) return 'checked';
	},

	isVenueEditor() {
		return this.user.venues.count() > 0;
	},
	roles() {
		return _.clone(Roles).reverse();
	},
	coursesByRole(role) {
		var templateData = Template.instance().data;
		var involvedIn = templateData.involvedIn;
		var userID = templateData.user._id;
		var coursesForRole = [];

		involvedIn.forEach(function(course) {
			if(!!HasRoleUser(course.members, role, userID)) {
				coursesForRole.push(course);
			}
		});
		return coursesForRole;
	},
	roleMyList() {
		return 'roles.'+this.type+'.myList';
	},
	unsubscribeSuccess() {
		return Router.current().params.query.unsubscribed === '';
	},
	unsubscribeError() {
		return Router.current().params.query['unsubscribe-error'] === '';
	}
});


TemplateMixins.FormfieldErrors(Template.profile, {
	'noUserName': {
		text: () => mf(
			'warning.noUserName',
			'Please enter a name for your user.'
		),
		field: 'username'
	},
	'userExists': {
		text: () => mf(
			'warning.userExists',
			'This username already exists. Please choose another one.'
		),
		field: 'username'
	},
	'nameError': {
		text: () => mf(
			'update.username.failed',
			'Failed to update username.'
		),
		field: 'username'
	},
	'noEmail': {
		text: () => mf(
			'warning.noEmailProvided',
			'Please enter a email.'
		),
		field: 'email'
	},
	'emailNotValid': {
		text: () => mf(
			'warning.emailNotValid',
			'Your email seems to have an error.'
		),
		field: 'email'
	},
	'emailExists': {
		text: () => mf(
			'warning.emailExists',
			'This email is already taken.'
		),
		field: 'email'
	},
});


Template.profile.events({
	'click .js-profile-info-edit'(event, instance) {
		Tooltips.hide();
		instance.editing.set(true);
		instance.collapse();
	},

	'click .js-profile-edit-cancel'(event, instance) {
		instance.editing.set(false);
		return false;
	},

	'click .js-change-pwd-btn'(event, instance) {
		instance.changingPass.set(true);
		instance.collapse();
	},

	'click .js-change-pwd-cancel'(event, instance) {
		instance.changingPass.set(false);
	},

	'click .js-expand'(event, instance) {
		instance.changingPass.set(false);
	},

	'click .js-profile-delete-confirm-btn'(event, instance) {
		instance.busy('deleting');
		Meteor.call('user.remove', function() {
			instance.busy(false);
			Alert.success(mf('profile.deleted', 'Your account has been deleted'));
		});
		instance.collapse(); // Wait for server to log us out.
	},

	'submit .profile-info-edit'(event, instance) {
		event.preventDefault();
		instance.errors.reset();
		Meteor.call('user.updateData',
			instance.$('.js-username').val(),
			instance.$('.js-email').val(),
			instance.$('.js-notifications').prop("checked"),
			function(err) {
				if (err) {
					instance.errors.add(err.error);
				} else {
					Alert.success(mf('profile.updated', 'Updated profile'));
					instance.editing.set(false);
				}
			}
		);
	},

	'submit #changePwd'(event, instance) {
		event.preventDefault();
		var old = document.getElementById('oldpassword').value;
		var pass = document.getElementById('newpassword').value;
		if (pass !== "") {
			if (pass !== document.getElementById('newpassword_confirm').value) {
				Alert.warning(mf('profile.passwordMismatch', "Sorry, Your new passwords don't match"));
				return;
			} else {
				var minLength = 5; // We've got _some_ standards
				if (pass.length < minLength) {
					Alert.warning(mf('profile.passwordShort', 'Your desired password is too short, sorry.'));
					return;
				}
				Accounts.changePassword(old, pass, function(err) {
					if (err) {
						Alert.error(err, 'Failed to change your password');
					} else {
						Alert.success(mf('profile.passwordChangedSuccess', 'You have changed your password successfully.'));
						instance.changingPass.set(false);
					}
				});
			}
		}
	},
});

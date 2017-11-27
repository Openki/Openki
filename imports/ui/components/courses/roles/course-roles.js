import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import SaveAfterLogin from '/imports/ui/lib/save-after-login.js';
import { MaySubscribe } from '/imports/utils/course-role-utils.js';

import '/imports/ui/components/buttons/buttons.js';

import './course-roles.html';

Template.courseRole.created = function() {
	this.enrolling = new ReactiveVar(false);

	this.busy(false);

	this.showFirstSteps = new ReactiveVar(false);

	this.firstSteps = () => {
		// make sure that first steps are only shown once per course
		const parentInstance = this.parentInstance();
		if (parentInstance.firstStepsShown) return;

		this.showFirstSteps.set(true);
		parentInstance.firstStepsShown = true;
	};	this.showFirstSteps = new ReactiveVar(false);

};

Template.courseRole.helpers({
	showFirstSteps: () => Template.instance().showFirstSteps.get(),

	enrolling: function() { return Template.instance().enrolling.get(); },

	roleSubscribe: function() {
		let role = this.type;
		if (role == 'participant') role = 'interested';

		return 'roles.' + role + '.subscribe';
	},

	roleSubscribed: function() {
		let role = this.type;
		if (role == 'participant') role = 'interested';

		return 'roles.' + role + '.subscribed';
	},

	maySubscribe: function(role) {
		var operator = Meteor.userId();

		// Show the participation buttons even when not logged-in.
		// fun HACK: if we pass an arbitrary string instead of falsy
		// the MaySubscribe() will return true if the user could subscribe
		// if they were logged-in. Plain abuse of MaySubscribe().
		if (!operator) operator = 'unlogged';

		return MaySubscribe(operator, this.course, operator, role);
	}
});

Template.courseRole.events({
	'click .js-role-enroll-btn'(event, instance) {
		event.preventDefault();
		instance.enrolling.set(true);
	},

	'click .js-role-subscribe-btn'(event, instance) {
		event.preventDefault();
		const comment = instance.$('.js-comment').val();
		instance.busy('enrolling');
		SaveAfterLogin(instance, mf('loginAction.enroll', 'Login and enroll'), () => {
			Meteor.call('add_role', this.course._id, Meteor.userId(), this.roletype.type, (err) => {
				if (err) {
					console.error(err);
				} else {
					template.firstSteps();
					instance.busy(false);
					instance.enrolling.set(false);
					Meteor.call('change_comment', this.course._id, comment, err => {
						instance.busy(false);
						if (err) {
							console.error(err);
						} else {
							instance.enrolling.set(false);
						}
					});
				}
			});
		});
	},

	'click .js-role-enroll-cancel': function (e, template) {
		template.enrolling.set(false);
		return false;
	},

	'click .js-role-unsubscribe-btn': function () {
		Meteor.call('remove_role', this.course._id, Meteor.userId(), this.roletype.type);
		return false;
	},

	'click .js-show-first-steps'(event, instance) {
		instance.firstSteps();
	},

	'click #firstStepsComment'() {
		$('.course-page-btn.js-discussion-edit').click();
		location.hash = '#discussion';
		RouterAutoscroll.scheduleScroll();
	}
});

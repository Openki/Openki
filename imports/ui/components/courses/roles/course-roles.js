import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import Alert from '/imports/api/alerts/alert';
import { Subscribe, Unsubscribe, processChange } from '/imports/api/courses/subscription';

import SaveAfterLogin from '/imports/ui/lib/save-after-login';

import '/imports/ui/components/buttons/buttons';

import './course-roles.html';

Template.courseRole.onCreated(function () {
	this.busy(false);
	this.enrolling = new ReactiveVar(false);
	this.showFirstSteps = new ReactiveVar(false);

	// Build a subscribe change
	this.subscribe = function (comment) {
		const user = Users.currentUser();
		return new Subscribe(this.data.course, user, this.data.roletype.type, comment);
	};

	// unsubscribe by email
	// HACK this is not the right place to act on router actions
	if (Router.current().params.query.unsubscribe === this.data.roletype.type) {
		SaveAfterLogin(this, mf('loginAction.unsubscribeFromCourse', 'Login and unsubscribe from Course'), () => {
			const user = Meteor.user();
			const change = new Unsubscribe(this.data.course, user, this.data.roletype.type);
			if (change.validFor(user)) {
				processChange(change, () => {
					Alert.success(mf('course.roles.unsubscribed', { NAME: this.data.course.name }, 'Unsubscribed from course {NAME}'));
				});
			} else {
				Alert.error(`${change} not valid for ${user}`);
			}
		});
	}
});

Template.courseRole.helpers({
	showFirstSteps: () => Template.instance().showFirstSteps.get(),

	enrolling() { return Template.instance().enrolling.get(); },

	roleSubscribe() {
		const role = this.type;
		if (role === 'participant') {
			return 'roles.interested.subscribe';
		}
		return `roles.${role}.subscribe`;
	},

	roleSubscribed() {
		const role = this.type;
		if (role === 'participant') {
			return 'roles.interested.subscribe';
		}
		return `roles.${role}.subscribed`;
	},

	roleIs(type) {
		return this.roletype.type === type;
	},

	maySubscribe() {
		const operator = Users.currentUser();
		return Template.instance().subscribe().validFor(operator);
	},
});

Template.courseRole.events({
	'click .js-role-enroll-btn'(event, instance) {
		event.preventDefault();
		instance.enrolling.set(true);
	},

	'click .js-role-subscribe-btn'(event, instance) {
		event.preventDefault();
		RouterAutoscroll.cancelNext();
		const comment = instance.$('.js-comment').val().trim();
		instance.busy('enrolling');
		SaveAfterLogin(instance, mf('loginAction.enroll', 'Login and enroll'), () => {
			processChange(instance.subscribe(comment), () => {
				RouterAutoscroll.cancelNext();
				instance.showFirstSteps.set(true);
				instance.busy(false);
				instance.enrolling.set(false);
			});
		});
	},

	'click .js-role-enroll-cancel'(e, template) {
		template.enrolling.set(false);
		return false;
	},

	'click .js-role-unsubscribe-btn'() {
		RouterAutoscroll.cancelNext();
		const change = new Unsubscribe(this.course, Meteor.user(), this.roletype.type);
		processChange(change);
		return false;
	},

	'click .js-toggle-first-steps'(event, instance) {
		instance.showFirstSteps.set(!instance.showFirstSteps.get());
	},

	'click .js-first-steps-comment'() {
		$('.course-page-btn.js-discussion-edit').click();
		window.location.hash = '#discussion';
		RouterAutoscroll.scheduleScroll();
	},
});

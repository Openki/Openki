import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { mf } from 'meteor/msgfmt:core';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import * as Alert from '/imports/api/alerts/alert';
import { Subscribe, Unsubscribe, processChange } from '/imports/api/courses/subscription';
import { Regions } from '/imports/api/regions/regions';
import { Users } from '/imports/api/users/users';

import SaveAfterLogin from '/imports/ui/lib/save-after-login';
import RouterAutoscroll from '/imports/ui/lib/router-autoscroll';

import { Analytics } from '/imports/ui/lib/analytics';

import '/imports/ui/components/buttons/buttons';

import './course-roles.html';

Template.courseRole.onCreated(function () {
	this.busy(false);
	this.enrolling = new ReactiveVar(false);
	this.showFirstSteps = new ReactiveVar(false);

	// Build a subscribe change
	this.subscribe = function (comment) {
		const user = Users.currentUser();
		return new Subscribe(this.data.course, user, this.data.role.type, comment);
	};

	// unsubscribe by email
	// HACK this is not the right place to act on router actions
	if (Router.current().params.query.unsubscribe === this.data.role.type) {
		SaveAfterLogin(
			this,
			mf('loginAction.unsubscribeFromCourse', 'Login and unsubscribe from Course'),
			mf('registerAction.unsubscribeFromCourse', 'Register and unsubscribe from Course'),
			async () => {
				const user = Meteor.user();
				const change = new Unsubscribe(this.data.course, user, this.data.role.type);
				if (change.validFor(user)) {
					await processChange(change);
					Alert.success(
						mf(
							'course.roles.unsubscribed',
							{ NAME: this.data.course.name },
							'Unsubscribed from course {NAME}',
						),
					);
				} else {
					Alert.error(`${change} not valid for ${user}`);
				}
			},
		);
	}
});

Template.courseRole.helpers({
	showFirstSteps() {
		return Template.instance().showFirstSteps.get();
	},

	enrolling() {
		return Template.instance().enrolling.get();
	},

	/**
	 * @param {string} type
	 */
	roleSubscribe(type) {
		return mf(`roles.${type}.subscribe`);
	},

	/**
	 * @param {string} type
	 */
	roleSubscribed(type) {
		return mf(`roles.${type}.subscribed`);
	},

	/**
	 * @param {string} type
	 */
	roleIs(type) {
		return this.role.type === type;
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
		SaveAfterLogin(
			instance,
			mf('loginAction.enroll', 'Login and enroll'),
			mf('registerAction.enroll', 'Register and enroll'),
			async () => {
				await processChange(instance.subscribe(comment));
				RouterAutoscroll.cancelNext();
				instance.showFirstSteps.set(true);
				instance.busy(false);
				instance.enrolling.set(false);

				Analytics.trackEvent(
					'Enrollments in courses',
					`Enrollments in courses as ${this.role.type}`,
					Regions.findOne(this.course.region)?.nameEn,
				);
			},
		);
	},

	'click .js-role-enroll-cancel'(e, template) {
		template.enrolling.set(false);
		return false;
	},

	async 'click .js-role-unsubscribe-btn'(event) {
		event.preventDefault();
		RouterAutoscroll.cancelNext();
		const change = new Unsubscribe(this.course, Meteor.user(), this.role.type);
		await processChange(change);
		RouterAutoscroll.cancelNext();
		Analytics.trackEvent(
			'Unsubscribes from courses',
			`Unsubscribes from courses as ${this.role.type}`,
			Regions.findOne(this.course.region)?.nameEn,
		);
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

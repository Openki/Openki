import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { i18n } from '/imports/startup/both/i18next';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import * as Alert from '/imports/api/alerts/alert';
import { Subscribe, Unsubscribe, processChange } from '/imports/api/courses/subscription';
import { Regions } from '/imports/api/regions/regions';
import { Users } from '/imports/api/users/users';
import { RoleEntity } from '/imports/api/roles/roles';
import { CourseModel } from '/imports/api/courses/courses';

import { SaveAfterLogin } from '/imports/ui/lib/save-after-login';
import RouterAutoscroll from '/imports/ui/lib/router-autoscroll';

import { Analytics } from '/imports/ui/lib/analytics';

import '/imports/ui/components/buttons';

import './template.html';
import './styles.scss';

export interface Data {
	role: RoleEntity;
	subscribed: boolean;
	course: CourseModel;
}

const Template = TemplateAny as TemplateStaticTyped<
	'courseRole',
	Data,
	{
		state: ReactiveDict<{ enrolling: boolean; showFirstSteps: boolean }>;
		courseSubscribe: (comment?: string) => Subscribe;
	}
>;

const template = Template.courseRole;

template.onCreated(function () {
	const instance = this;

	instance.busy(false);
	instance.state = new ReactiveDict();
	instance.state.setDefault({ enrolling: false, showFirstSteps: false });

	// Build a subscribe change
	instance.courseSubscribe = (comment) => {
		const user = Users.currentUser();
		return new Subscribe(instance.data.course, user, instance.data.role.type, comment);
	};

	// unsubscribe by email
	// HACK this is not the right place to act on router actions
	if (Router.current().params.query.unsubscribe === instance.data.role.type) {
		SaveAfterLogin(
			instance,
			i18n('loginAction.unsubscribeFromCourse', 'Log in and unsubscribe from course'),
			i18n('registerAction.unsubscribeFromCourse', 'Register and unsubscribe from course'),
			async () => {
				const user = Meteor.user();
				const change = new Unsubscribe(instance.data.course, user, instance.data.role.type);
				if (change.validFor(user)) {
					await processChange(change);
					Alert.success(
						i18n('course.roles.unsubscribed', 'Unsubscribed from {NAME} course', {
							NAME: instance.data.course.name,
						}),
					);
				} else {
					Alert.error(`${change} not valid for ${user}`);
				}
			},
		);
	}
});

template.helpers({
	roleSubscribe(type: string) {
		return i18n(`roles.${type}.subscribe`);
	},

	roleSubscribed(type: string) {
		return i18n(`roles.${type}.subscribed`);
	},

	roleIs(type: string) {
		const { data } = Template.instance();
		return data.role.type === type;
	},

	maySubscribe() {
		const operator = Users.currentUser();
		return Template.instance().courseSubscribe().validFor(operator);
	},
});

template.events({
	'click .js-role-enroll-btn'(event, instance) {
		event.preventDefault();
		instance.state.set('enrolling', true);
	},

	'click .js-role-subscribe-btn'(event, instance) {
		event.preventDefault();
		RouterAutoscroll.cancelNext();

		const { data } = instance;
		const comment = (instance.$('.js-comment').val() as string).trim();
		instance.busy('enrolling');
		SaveAfterLogin(
			instance,
			i18n('loginAction.enroll', 'Log in and enroll'),
			i18n('registerAction.enroll', 'Register and enroll'),
			async () => {
				await processChange(instance.courseSubscribe(comment));
				RouterAutoscroll.cancelNext();
				instance.busy(false);
				instance.state.set('showFirstSteps', true);
				instance.state.set('enrolling', false);

				Analytics.trackEvent(
					'Enrollments in courses',
					`Enrollments in courses as ${data.role.type}`,
					Regions.findOne(data.course.region)?.nameEn,
				);
			},
		);
	},

	'click .js-role-enroll-cancel'(_event, instance) {
		instance.state.set('enrolling', false);
		return false;
	},

	async 'click .js-role-unsubscribe-btn'(event, instance) {
		event.preventDefault();
		RouterAutoscroll.cancelNext();

		const { data } = instance;

		const change = new Unsubscribe(data.course, Meteor.user(), data.role.type);
		await processChange(change);
		RouterAutoscroll.cancelNext();
		Analytics.trackEvent(
			'Unsubscribes from courses',
			`Unsubscribes from courses as ${data.role.type}`,
			Regions.findOne(data.course.region)?.nameEn,
		);
	},

	'click .js-toggle-first-steps'(_event, instance) {
		instance.state.set('showFirstSteps', !instance.state.get('showFirstSteps'));
	},

	'click .js-first-steps-comment'() {
		$('.course-page-btn.js-discussion-edit').trigger('click');
		window.location.hash = '#discussion';
		RouterAutoscroll.scheduleScroll();
	},
});

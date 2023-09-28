import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import './register-frame';
import './forgot-pwd-frame';
import './visitor-frame';
import './login-frame';

import './template.html';

const Template = TemplateAny as TemplateStaticTyped<
	'accountTasks',
	unknown,
	{
		accountTask: ReactiveVar<string>;
		transferUsername: boolean;
		transferPassword: boolean;
		transferMail: boolean;
	}
>;

const template = Template.accountTasks;

template.onCreated(function () {
	const instance = this;

	instance.accountTask = new ReactiveVar('login');
	instance.autorun(() => {
		if (Session.equals('pleaseLogin', true)) {
			instance.$('.js-account-tasks').modal('show');
		}
	});
});

template.helpers({
	activeAccountTask(task: string) {
		return Template.instance().accountTask.get() === task;
	},
	pleaseLogin() {
		return Session.get('pleaseLogin');
	},
});

template.events({
	'show.bs.modal .js-account-tasks'(_event, instance) {
		/* eslint-disable-next-line no-param-reassign */
		instance.transferUsername = false;
		/* eslint-disable-next-line no-param-reassign */
		instance.transferPassword = false;
		/* eslint-disable-next-line no-param-reassign */
		instance.transferMail = false;
	},

	'shown.bs.modal .js-account-tasks'(_event, instance) {
		instance.$('input').first().trigger('select');
	},

	'hide.bs.modal .js-account-tasks'(_event, instance) {
		instance.$('input').val('');
	},

	'hidden.bs.modal .js-account-tasks'(_event, instance) {
		instance.accountTask.set('login');
		Session.set('pleaseLogin', false);
	},
});

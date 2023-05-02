import { i18n } from '/imports/startup/both/i18next';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import * as Alert from '/imports/api/alerts/alert';
import * as emailMethods from '/imports/api/emails/methods';

import '/imports/ui/components/buttons';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	'report',
	Record<string, unknown>,
	{
		state: ReactiveVar<string>;
	}
>;

const template = Template.report;

template.onCreated(function () {
	this.state = new ReactiveVar('');
});

template.helpers({
	reporting() {
		return Template.instance().state.get() === 'reporting';
	},
	sending() {
		return Template.instance().state.get() === 'sending';
	},
});

template.events({
	'click .js-report'(event, instance) {
		event.preventDefault();
		instance.state.set('reporting');
	},

	'click .js-report-cancel'(event, instance) {
		event.preventDefault();
		instance.state.set('');
	},

	async 'submit .js-report-send'(event, instance) {
		event.preventDefault();

		const message = instance.$('.js-report-message').val() as string;

		instance.state.set('sending');
		try {
			await emailMethods.sendReport(
				document.title,
				window.location.href,
				navigator.userAgent,
				message,
			);
			Alert.success(
				i18n(
					'report.confirm',
					'Your report was sent. A human will try to find an appropriate solution.',
				),
			);
		} catch (err) {
			Alert.serverError(err, i18n('report.notSent', 'Your report could not be sent'));
		} finally {
			instance.state.set('');
		}
	},
});

import { i18n } from '/imports/startup/both/i18next';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import * as Alert from '/imports/api/alerts/alert';
import * as emailMethods from '/imports/api/emails/methods';

import '/imports/ui/components/buttons/buttons';
import * as TemplateMixins from '/imports/ui/lib/template-mixins';

import './template.html';
import './styles.scss';

const TemplateBase = TemplateAny as TemplateStaticTyped<
	Record<string, unknown>,
	'report',
	{
		state: ReactiveVar<string>;
	}
>;

const Template = TemplateMixins.FormfieldErrors(TemplateBase, 'report', {
	reportMessage: {
		text: () =>
			i18n(
				'report.warning.tooShort',
				'The report message is too short! Please write more than 5 characters.',
			),
		field: 'reportMessage',
	},
});

const template = Template.report;

template.onCreated(function () {
	this.state = new ReactiveVar('');
});

template.helpers({
	reporting: () => Template.instance().state.get() === 'reporting',
	sending: () => Template.instance().state.get() === 'sending',
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

	async 'click .js-report-send'(event, instance) {
		event.preventDefault();
		instance.errors.reset();

		const message = instance.$('.js-report-message').val() as string;
		if (!message || message.length <= 5) {
			instance.errors.add('reportMessage');
		}

		if (instance.errors.present()) {
			return;
		}

		instance.state.set('sending');
		try {
			await emailMethods.report(document.title, window.location.href, navigator.userAgent, message);
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

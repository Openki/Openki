import { ReactiveDict } from 'meteor/reactive-dict';
import { Meteor } from 'meteor/meteor';
import { i18n } from '/imports/startup/both/i18next';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import * as Alert from '/imports/api/alerts/alert';
import * as emailMethods from '/imports/api/emails/methods';

import './template.html';

const Template = TemplateAny as TemplateStaticTyped<
	'verifyEmail',
	Record<string, unknown>,
	{
		state: ReactiveDict<{ sending: boolean }>;
	}
>;

const template = Template.verifyEmail;

template.onCreated(function () {
	this.state = new ReactiveDict(undefined, { sending: false });
});

template.events({
	async 'click .js-verify-mail-btn'(_event, instance) {
		instance.state.set('sending', true);

		try {
			await emailMethods.sendVerificationEmail();
			Alert.success(
				i18n(
					'profile.sentVerificationMail',
					'Verification mail has been sent to your address: "{MAIL}".',
					{ MAIL: Meteor.user()?.emails[0].address },
				),
			);
		} catch (err) {
			instance.state.set('sending', false);
			Alert.serverError(err, 'Could not send verification e-mail');
		}
	},
});

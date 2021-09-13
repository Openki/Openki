import { ReactiveDict } from 'meteor/reactive-dict';
import { Meteor } from 'meteor/meteor';
import i18next from 'i18next';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import * as Alert from '/imports/api/alerts/alert';
import * as emailMethods from '/imports/api/emails/methods';

import './template.html';

const Template = TemplateAny as TemplateStaticTyped<
	Record<string, unknown>,
	'verifyEmail',
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
				i18next.t(
					'profile.sentVerificationMail',
					'Verification mail has been sent to your address: "{MAIL}".',
					{ MAIL: Meteor.user()?.emails[0].address },
				),
			);
		} catch (err) {
			instance.state.set('sending', false);
			Alert.serverError(err, 'Failed to send verification mail');
		}
	},
});

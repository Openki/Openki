import { ReactiveDict } from 'meteor/reactive-dict';
import { Meteor } from 'meteor/meteor';
import { mf } from 'meteor/msgfmt:core';
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
				mf(
					'profile.sentVerificationMail',
					{ MAIL: Meteor.user()?.emails[0].address },
					'Verification mail has been sent to your address: "{MAIL}".',
				),
			);
		} catch (err) {
			instance.state.set('sending', false);
			Alert.serverError(err, 'Failed to send verification mail');
		}
	},
});

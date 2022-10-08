import { Meteor } from 'meteor/meteor';
import { i18n } from '/imports/startup/both/i18next';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import * as Alert from '/imports/api/alerts/alert';
import * as emailMethods from '/imports/api/emails/methods';

import { PleaseLogin } from '/imports/ui/lib/please-login';

import '/imports/ui/components/profiles/verify-email';

import './template.html';
import './styles.scss';

export interface Data {
	placeholder: string;
	onSend: (
		message: string,
		options: {
			revealAddress: boolean;
			sendCopy: boolean;
		},
	) => Promise<void>;
}

const Template = TemplateAny as TemplateStaticTyped<
	'sendMessage',
	Data,
	{
		state: ReactiveDict<{
			revealAddress: boolean;
			sendCopy: boolean;
			verificationMailSent: boolean;
		}>;
	}
>;

const template = Template.sendMessage;

template.onCreated(function () {
	this.busy(false);
	this.state = new ReactiveDict();
	this.state.setDefault({
		revealAddress: false,
		sendCopy: false,
		verificationMailSent: false,
	});
});

template.onRendered(function () {
	this.$('.js-email-message').trigger('select');
});

template.events({
	async 'click .js-verify-mail'(_event, instance) {
		instance.state.set('verificationMailSent', true);

		const user = Meteor.user();

		if (!user) {
			throw new Error('Unexpected null: user');
		}

		try {
			await emailMethods.sendVerificationEmail();

			Alert.success(i18n('profile.sentVerificationMail', { MAIL: user.emails[0].address }));
		} catch (err) {
			instance.state.set('verificationMailSent', false);
			Alert.serverError(
				err,
				i18n('profile.sendVerificationMailFailed', 'Could not send verification e-mail'),
			);
		}
	},

	'change input[type="checkbox"]'(event, instance) {
		const target = instance.$((event as any).currentTarget as any);
		instance.state.set(target.attr('name') as any, target.prop('checked'));
	},

	async 'submit .js-send-message'(event, instance) {
		event.preventDefault();

		instance.busy('sending');
		PleaseLogin(instance, async () => {
			const { state } = instance;
			const message = instance.$('.js-email-message').val() as string;

			if (message.length < 2) {
				Alert.error(i18n('profile.mail.longertext', 'longer text please'));
				instance.busy(false);
				return;
			}

			const options = {
				revealAddress: state.get('revealAddress') || false,
				sendCopy: state.get('sendCopy') || false,
			};

			const { data } = instance;

			try {
				await data.onSend(message, options);
				Alert.success(i18n('profile.mail.sent', 'Your message was sent'));
			} catch (err) {
				Alert.serverError(err, i18n('profile.mail.sendFailed', 'Your message was not sent'));
			} finally {
				instance.busy(false);
			}
			instance.$('.js-email-message').val('');
		});
	},
});

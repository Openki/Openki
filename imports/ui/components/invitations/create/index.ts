import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { ReactiveDict } from 'meteor/reactive-dict';
import { mf } from 'meteor/msgfmt:core';

import * as InvitationsMethods from '/imports/api/invitations/methods';
import * as Alert from '/imports/api/alerts/alert';

import { isEmail } from '/imports/utils/email-tools';
import * as TemplateMixins from '/imports/ui/lib/template-mixins';

import './template.html';

const template = Template.invitationsCreate as Blaze.Template;

TemplateMixins.FormfieldErrors(template, {
	notValid: {
		text: () =>
			mf(
				'tenant.settings.invitations.error.notValid',
				'Some of the e-mail addresses are not valid.',
			),
		field: 'invitations-emails',
	},
});

type InvitationsCreateTemplateInstance = Blaze.TemplateInstance &
	TemplateMixins.FormfieldErrorsTemplateInstance & {
		state: ReactiveDict<{ tried: boolean }>;
		reset(): void;
		getLines(): string[];
		normalizeList(): void;
		checkList(): boolean;
		getEmails(): string[];
	};

template.onCreated(function () {
	const instance = this as InvitationsCreateTemplateInstance;
	instance.busy('notReady');

	instance.state = new ReactiveDict(undefined, {
		tried: false,
	});

	instance.reset = () => {
		instance.errors.reset();
		instance.$('.js-invitations-emails').val('');
		instance.state.set('tried', false);
	};

	instance.getLines = () => {
		const emails = instance.$('.js-invitations-emails').val() as string;

		return emails.split(/[\s;,|]+/g).filter((l) => l);
	};
	instance.normalizeList = () => {
		instance.$('.js-invitations-emails').val(instance.getLines().join('\n'));
	};
	instance.checkList = () => {
		instance.errors.reset();

		const lines = instance.getLines();

		if (lines.length === 0) {
			return false;
		}

		if (lines.some((e) => !isEmail(e))) {
			instance.errors.add('notValid');
			return false;
		}

		return true;
	};
	instance.getEmails = () => instance.getLines().filter((e) => isEmail(e));
});

template.events({
	'keyup .js-invitations-emails, change .js-invitations-emails'(
		_event: any,
		instance: InvitationsCreateTemplateInstance,
	) {
		if (instance.getLines() && (!instance.state.get('tried') || instance.checkList())) {
			instance.busy(false);
		} else {
			instance.busy('notReady');
		}
	},
	'focusout .js-invitations-emails'(_event: any, instance: InvitationsCreateTemplateInstance) {
		instance.normalizeList();
	},
	async 'submit .js-create-invitations'(event: any, instance: InvitationsCreateTemplateInstance) {
		event.preventDefault();

		instance.state.set('tried', true);

		if (!instance.checkList()) {
			instance.busy('notReady');
			return;
		}

		instance.busy('sending');
		try {
			await InvitationsMethods.createMany(instance.data.tenant._id, instance.getEmails());

			Alert.success(
				mf('tenant.settings.invitations.creation.success', 'Invitations have been created.'),
			);

			instance.reset();
		} catch (err) {
			Alert.serverError(
				err,
				mf('tenant.settings.invitations.creation.error', 'Invitations could not be created.'),
			);
		} finally {
			instance.busy(false);
		}
	},
});

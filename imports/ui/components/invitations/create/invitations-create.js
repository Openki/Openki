import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { mf } from 'meteor/msgfmt:core';

import * as InvitationsMethods from '/imports/api/invitations/methods';
import * as Alert from '/imports/api/alerts/alert';

import { isEmail } from '/imports/utils/email-tools';
import TemplateMixins from '/imports/ui/lib/template-mixins';

import './invitations-create.html';

Template.invitationsCreate.onCreated(function () {
	const instance = this;
	instance.busy('notReady');

	instance.state = new ReactiveDict();
	instance.state.setDefault({
		tried: false,
	});

	instance.reset = () => {
		instance.errors.reset();
		instance.$('.js-invitations-emails').val('');
		instance.state.set('tried', false);
	};

	instance.getLines = () => {
		/** @type {string} */
		const emails = instance.$('.js-invitations-emails').val();

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

TemplateMixins.FormfieldErrors(Template.invitationsCreate, {
	notValid: {
		text: () =>
			mf(
				'tenant.settings.invitations.error.notValid',
				'Some of the e-mail addresses are not valid.',
			),
		field: 'invitations-emails',
	},
});

Template.invitationsCreate.events({
	'keyup .js-invitations-emails, change .js-invitations-emails'(event, instance) {
		if (instance.getLines() && (!instance.state.get('tried') || instance.checkList())) {
			instance.busy(false);
		} else {
			instance.busy('notReady');
		}
	},
	'focusout .js-invitations-emails'(event, instance) {
		instance.normalizeList();
	},
	async 'submit .js-create-invitations'(event, instance) {
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

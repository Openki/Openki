import { i18n } from '/imports/startup/both/i18next';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

import * as Alert from '/imports/api/alerts/alert';
import * as usersMethods from '/imports/api/users/methods';

import * as TemplateMixins from '/imports/ui/lib/template-mixins';

import './template.html';

{
	const Template = TemplateAny as TemplateStaticTyped<'emailRequest'>;

	const template = Template.emailRequest;

	template.helpers({
		showEmailRequest() {
			const user = Meteor.user();
			return user && !user.hasEmail();
		},
	});
}

{
	const TemplateBase = TemplateAny as TemplateStaticTyped<'emailRequestModal'>;

	const Template = TemplateMixins.FormfieldErrors(TemplateBase, 'emailRequestModal', {
		noEmail: {
			text: () => i18n('register.warning.noEmailProvided'),
			field: 'email',
		},
		'email invalid': {
			text: () => i18n('register.warning.emailNotValid', 'Your email seems to have an error.'),
			field: 'email',
		},
		emailExists: {
			text: () => i18n('register.warning.emailExists'),
			field: 'email',
		},
	});

	const template = Template.emailRequestModal;

	template.onCreated(function () {
		this.busy(false);
	});

	template.onRendered(function () {
		this.$('.js-email-request-modal').modal('show');
	});

	template.events({
		async 'click .js-save-email'(event, instance) {
			event.preventDefault();

			instance.errors.reset();

			const email = (instance.$('.js-email').val() as string).trim();
			if (!email) {
				instance.errors.add('noEmail');
			}

			if (instance.errors.present()) {
				return;
			}

			instance.busy('saving');
			try {
				await usersMethods.updateEmail(email);

				Alert.success(i18n('profile.updated', 'Updated profile'));
				instance.$('.js-email-request-modal').modal('hide');
			} catch (err) {
				instance.errors.add(err.reason);
			} finally {
				instance.busy(false);
			}
		},
	});
}

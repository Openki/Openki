import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { i18n } from '/imports/startup/both/i18next';
import { ReactiveDict } from 'meteor/reactive-dict';
import $ from 'jquery';

import { InvitationEntity, Invitations, Status } from '/imports/api/invitations/invitations';
import * as InvitationsMethods from '/imports/api/invitations/methods';
import * as Alert from '/imports/api/alerts/alert';
import { TenantModel } from '/imports/api/tenants/tenants';

import '/imports/ui/components/profile-link';

import './template.html';

export interface Data {
	tenant: TenantModel;
}

const Template = TemplateAny as TemplateStaticTyped<
	'invitationsList',
	Data,
	{
		state: ReactiveDict<{ showAccepted: boolean }>;
	}
>;

const template = Template.invitationsList;

template.onCreated(function () {
	const instance = this;
	const { tenant } = instance.data;

	instance.state = new ReactiveDict(undefined, {
		showAccepted: false,
	});
	instance.autorun(() => {
		instance.subscribe('invitations.findFilter', { tenant: tenant._id });
	});
});

Template.invitationsList.helpers({
	hasSomeInvitations() {
		const instance = Template.instance();
		return Invitations.findFilter({ tenant: instance.data.tenant._id }, 1).count() > 0;
	},

	invitations() {
		const instance = Template.instance();

		const status: Status[] = ['created', 'send', 'failed'];

		if (instance.state.get('showAccepted')) {
			status.push('accepted');
		}

		return Invitations.findFilter({ tenant: instance.data.tenant._id, status });
	},

	status(status: Status) {
		switch (status) {
			case 'created':
				return i18n('invitations.status.created', 'Created');
			case 'send':
				return i18n('invitations.status.send', 'Send');
			case 'accepted':
				return i18n('invitations.status.accepted', 'Accepted');
			case 'failed':
				return i18n('invitations.status.failed', 'failed');

			default:
				return status;
		}
	},
});

Template.invitationsList.events({
	'change .js-showAccepted'(event, instance) {
		instance.state.set('showAccepted', $(event.currentTarget).prop('checked'));
	},

	async 'click .js-remove'(this: InvitationEntity, event, instance) {
		event.preventDefault();

		try {
			await InvitationsMethods.remove(instance.data.tenant._id, this._id);
		} catch (err) {
			Alert.serverError(
				err,
				i18n('tenant.settings.invitations.removed.error', 'Invitations could not be removed.'),
			);
		}
	},
});

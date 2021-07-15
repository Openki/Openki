import { Template } from 'meteor/templating';
import { mf } from 'meteor/msgfmt:core';

import { Invitations } from '/imports/api/invitations/invitations';
import * as InvitationsMethods from '/imports/api/invitations/methods';
import * as Alert from '/imports/api/alerts/alert';

import './invitations-list.html';

Template.invitationsList.onCreated(function () {
	const instance = this;
	const { tenant } = instance.data;
	instance.autorun(() => {
		instance.subscribe('invitations.find', { tenant: tenant._id });
	});
});

Template.invitationsList.helpers({
	/**
	 * @param {string} tenantId
	 */
	invitations(tenantId) {
		return Invitations.find({ tenant: tenantId });
	},

	/**
	 * @param {'created' | 'send' | 'used' | 'failed' } status
	 */
	status(status) {
		switch (status) {
			case 'created':
				return mf('invitations.status.created', 'Created');
			case 'send':
				return mf('invitations.status.send', 'Send');
			case 'used':
				return mf('invitations.status.used', 'Used');
			case 'failed':
				return mf('invitations.status.failed', 'failed');

			default:
				return status;
		}
	},
});

Template.invitationsList.events({
	async 'click .js-remove'(event, instance) {
		event.preventDefault();

		try {
			await InvitationsMethods.remove(instance.data.tenant._id, this._id);
		} catch (err) {
			Alert.serverError(
				err,
				mf('tenant.settings.invitations.removed.error', 'Invitations could not be removed.'),
			);
		}
	},
});

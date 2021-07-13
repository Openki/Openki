import { Template } from 'meteor/templating';
import { mf } from 'meteor/msgfmt:core';

import { Invitations } from '/imports/api/invitations/invitations';

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
	 * @param {'created' | 'send' | 'used'} status
	 */
	status(status) {
		switch (status) {
			case 'created':
				return mf('invitations.status.created', 'Created');
			case 'send':
				return mf('invitations.status.send', 'Send');
			case 'used':
				return mf('invitations.status.used', 'Used');

			default:
				return status;
		}
	},
});

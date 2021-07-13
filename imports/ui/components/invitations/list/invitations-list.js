import { Template } from 'meteor/templating';

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
});

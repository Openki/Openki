import { Template } from 'meteor/templating';
import { mf } from 'meteor/msgfmt:core';
import { ReactiveDict } from 'meteor/reactive-dict';
import $ from 'jquery';

import { Invitations } from '/imports/api/invitations/invitations';
import * as InvitationsMethods from '/imports/api/invitations/methods';
import * as Alert from '/imports/api/alerts/alert';

import './invitations-list.html';

Template.invitationsList.onCreated(function () {
	const instance = this;
	const { tenant } = instance.data;

	instance.state = new ReactiveDict(undefined, {
		showAccepted: false,
	});
	instance.autorun(() => {
		const status = ['created', 'send', 'failed'];

		if (instance.state.get('showAccepted')) {
			status.push('accepted');
		}

		instance.subscribe('invitations.findFilter', { tenant: tenant._id, status });
	});
});

Template.invitationsList.helpers({
	hasInvitations() {
		const instance = Template.instance();
		return Invitations.findFilter({ tenant: instance.data.tenant._id }, 1).count() > 0;
	},

	invitations() {
		const instance = Template.instance();

		const status = ['created', 'send', 'failed'];

		if (instance.state.get('showAccepted')) {
			status.push('accepted');
		}

		return Invitations.findFilter({ tenant: instance.data.tenant._id, status });
	},

	/**
	 * @param {'created' | 'send' | 'accepted' | 'failed' } status
	 */
	status(status) {
		switch (status) {
			case 'created':
				return mf('invitations.status.created', 'Created');
			case 'send':
				return mf('invitations.status.send', 'Send');
			case 'accepted':
				return mf('invitations.status.accepted', 'Accepted');
			case 'failed':
				return mf('invitations.status.failed', 'failed');

			default:
				return status;
		}
	},
});

Template.invitationsList.events({
	'change .js-showAccepted'(event, instance) {
		instance.state.set('showAccepted', $(event.currentTarget).prop('checked'));
	},

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

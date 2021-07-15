import { Template } from 'meteor/templating';
import { mf } from 'meteor/msgfmt:core';
import { Router } from 'meteor/iron:router';

import * as InvitationsMethods from '/imports/api/invitations/methods';
import * as Alert from '/imports/api/alerts/alert';
import SaveAfterLogin from '/imports/ui/lib/save-after-login';

import './invitation.html';

Template.invitation.events({
	async 'click .js-join'(event, instance) {
		event.preventDefault();

		instance.busy('join');
		SaveAfterLogin(
			instance,
			mf('loginAction.invitation.join', 'Login and join'),
			mf('registerAction.invitation.join', 'Register and join'),
			async () => {
				try {
					await InvitationsMethods.join(
						instance.data.invitation.tenant,
						instance.data.invitation.token,
					);

					Router.go('/');

					Alert.success(
						mf(
							'invitation.join.success',
							{ NAME: instance.data.tenant.name },
							'You joined to tenant "{NAME}".',
						),
					);
				} catch (err) {
					Alert.serverError(err, mf('invitation.join.error', 'Join not worked.'));
				} finally {
					instance.busy(false);
				}
			},
		);
	},
});

import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { mf } from 'meteor/msgfmt:core';
import { Router } from 'meteor/iron:router';

import * as Alert from '/imports/api/alerts/alert';
import { InvitationEntity } from '/imports/api/invitations/invitations';
import * as InvitationsMethods from '/imports/api/invitations/methods';
import { TenantModel } from '/imports/api/tenants/tenants';

import SaveAfterLogin from '/imports/ui/lib/save-after-login';
import * as RegionSelection from '/imports/utils/region-selection';

import './template.html';

const Template = TemplateAny as TemplateStaticTyped<
	{
		tenant: TenantModel;
		invitation: InvitationEntity;
	},
	'invitation',
	Record<string, unknown>
>;

const template = Template.invitation;

template.events({
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

					RegionSelection.subscribe(); // Reload regions to load regions from tenant

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

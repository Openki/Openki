import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import i18next from 'i18next';
import { Router } from 'meteor/iron:router';

import * as Alert from '/imports/api/alerts/alert';
import { InvitationEntity } from '/imports/api/invitations/invitations';
import * as InvitationsMethods from '/imports/api/invitations/methods';
import { TenantModel } from '/imports/api/tenants/tenants';

import { SaveAfterLogin } from '/imports/ui/lib/save-after-login';
import * as RegionSelection from '/imports/utils/region-selection';

import './template.html';

const Template = TemplateAny as TemplateStaticTyped<
	{
		tenant: TenantModel;
		invitation: InvitationEntity;
	},
	'invitationPage',
	Record<string, unknown>
>;

const template = Template.invitationPage;

template.events({
	async 'click .js-join'(event, instance) {
		event.preventDefault();

		instance.busy('join');
		SaveAfterLogin(
			instance,
			i18next.t('loginAction.invitation.join', 'Login and join'),
			i18next.t('registerAction.invitation.join', 'Register and join'),
			async () => {
				try {
					await InvitationsMethods.join(
						instance.data.invitation.tenant,
						instance.data.invitation.token,
					);

					// Reload regions to load regions from tenant
					RegionSelection.subscribe(instance.data.invitation.tenant, false);

					Router.go('/');

					Alert.success(
						i18next.t('invitation.join.success', 'You joined to tenant "{NAME}".', {
							NAME: instance.data.tenant.name,
						}),
					);
				} catch (err) {
					Alert.serverError(err, i18next.t('invitation.join.error', 'Join not worked.'));
				} finally {
					instance.busy(false);
				}
			},
		);
	},
});

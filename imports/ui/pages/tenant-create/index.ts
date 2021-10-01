import { i18n } from '/imports/startup/both/i18next';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Router } from 'meteor/iron:router';

import * as Alert from '/imports/api/alerts/alert';
import { TenantModel } from '/imports/api/tenants/tenants';
import { RegionModel } from '/imports/api/regions/regions';
import * as TenantsMethods from '/imports/api/tenants/methods';
import * as RegionsMethods from '/imports/api/regions/methods';

import { LocationTracker } from '../../lib/location-tracker';
import { SaveAfterLogin } from '../../lib/save-after-login';
import { Analytics } from '../../lib/analytics';

import '/imports/ui/components/buttons';
import '/imports/ui/components/editable/editable';
import '/imports/ui/components/map/map';

import '/imports/ui/components/regions/display';
import '/imports/ui/components/regions/edit';

import './template.html';

export interface Data {
	tenant: TenantModel;
	retion: RegionModel;
}

const Template = TemplateAny as TemplateStaticTyped<
	Data,
	'tenantCreatePage',
	{
		locationTracker: LocationTracker;
	}
>;

const template = Template.tenantCreatePage;

template.onCreated(function () {
	const instance = this;
	instance.busy(false);

	instance.locationTracker = new LocationTracker();
});

template.helpers({
	locationTracker() {
		return Template.instance().locationTracker;
	},
});

template.events({
	submit(event, instance) {
		event.preventDefault();

		const tenantName = instance.$('.js-tenant-name').val() as string;

		if (!tenantName) {
			Alert.error(i18n('tenant.create.plsGiveName', 'Please give a organisation name'));
			return;
		}

		const changes = {
			name: instance.$('.js-name').val() as string,
			tz: instance.$('.js-timezone').val() as string,
		} as Omit<RegionsMethods.CreateFields, 'tenant'>;

		if (!changes.name) {
			Alert.error(i18n('tenant.region.create.plsGiveName', 'Please give your region a name'));
			return;
		}

		const loc = instance.locationTracker.getLocation();
		if (loc) {
			changes.loc = loc;
		} else {
			Alert.error(
				i18n(
					'tenant.region.create.plsSelectPointOnMap',
					'Please add a marker on the map by clicking on the "+" sign.',
				),
			);
			return;
		}

		instance.busy('saving');
		SaveAfterLogin(
			instance,
			i18n('loginAction.createPrivateRegion', 'Login and create private region'),
			i18n('registerAction.createPrivateRegion', 'Register and create private region'),
			async () => {
				try {
					const tenantId = await TenantsMethods.create({ name: tenantName });
					await RegionsMethods.create({ tenant: tenantId, ...changes });

					Router.go('tenantDetails', { _id: tenantId });

					Alert.success(
						i18n('privateRegion.saving.success', 'Created region "{NAME}".', {
							NAME: changes.name,
						}),
					);

					Analytics.trackEvent('Tenant creations', 'Tenant with region creations');
				} catch (err) {
					Alert.serverError(
						err,
						i18n('privateRegion.creating.error', 'Creating the region went wrong'),
					);
				} finally {
					instance.busy(false);
				}
			},
		);
	},

	'click .js-edit-cancel'() {
		Router.go('profile');
	},
});

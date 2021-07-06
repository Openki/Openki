import { mf } from 'meteor/msgfmt:core';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';

import * as Alert from '/imports/api/alerts/alert';
import * as TenantsMethods from '/imports/api/tenants/methods';
import * as RegionsMethods from '/imports/api/regions/methods';

import { LocationTracker } from '../../lib/location-tracker';
import SaveAfterLogin from '../../lib/save-after-login';
import { Analytics } from '../../lib/analytics';

import '/imports/ui/components/buttons/buttons';
import '/imports/ui/components/editable/editable';
import '/imports/ui/components/map/map';

import '/imports/ui/components/regions/display/region-display';
import '/imports/ui/components/regions/edit/region-edit';

import './tenant-create.html';

Template.tenantCreate.onCreated(function () {
	const instance = this;
	instance.busy(false);

	instance.locationTracker = LocationTracker();
});

Template.tenantCreate.helpers({
	locationTracker() {
		return Template.instance().locationTracker;
	},
});

Template.tenantCreate.events({
	submit(event, instance) {
		event.preventDefault();

		const tenantName = instance.$('.js-tenant-name').val();

		if (!tenantName) {
			Alert.error(mf('tenant.create.plsGiveName', 'Please give a organisation name'));
			return;
		}

		const changes = {
			name: instance.$('.js-name').val(),
			tz: instance.$('.js-timezone').val(),
		};

		if (!changes.name) {
			Alert.error(mf('tenant.region.create.plsGiveName', 'Please give your region a name'));
			return;
		}

		const loc = instance.locationTracker.getLocation();
		if (loc) {
			changes.loc = loc;
		} else {
			Alert.error(
				mf(
					'tenant.region.create.plsSelectPointOnMap',
					'Please add a marker on the map by clicking on the "+" sign.',
				),
			);
			return;
		}

		instance.busy('saving');
		SaveAfterLogin(
			instance,
			mf('loginAction.createPrivateRegion', 'Login and create private region'),
			mf('registerAction.createPrivateRegion', 'Register and create private region'),
			async () => {
				try {
					const tenantId = await TenantsMethods.create({ name: tenantName });
					await RegionsMethods.create({ tenant: tenantId, ...changes });

					Router.go('tenantDetails', { _id: tenantId });

					Alert.success(
						mf('privateRegion.saving.success', { NAME: changes.name }, 'Created region "{NAME}".'),
					);

					Analytics.trackEvent('Tenant creations', 'Tenant with region creations');
				} catch (err) {
					Alert.serverError(
						err,
						mf('privateRegion.creating.error', 'Creating the region went wrong'),
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

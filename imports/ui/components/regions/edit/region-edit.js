import { check } from 'meteor/check';
import { Router } from 'meteor/iron:router';
import { mf } from 'meteor/msgfmt:core';
import { Template } from 'meteor/templating';
import moment from 'moment-timezone';

import * as Alert from '/imports/api/alerts/alert';
import * as RegionsMethods from '/imports/api/regions/methods';
import { LocationTracker } from '/imports/ui/lib/location-tracker';
import SaveAfterLogin from '/imports/ui/lib/save-after-login';

import '/imports/ui/components/buttons/buttons';
import '/imports/ui/components/editable/editable';
import '/imports/ui/components/map/map';

import './region-edit.html';

Template.regionEdit.onCreated(function () {
	const instance = this;
	instance.busy(false);

	this.autorun(() => {
		check(instance.data.region.tenant, String);
	});

	instance.locationTracker = LocationTracker();

	instance.locationTracker.markers.find().observe({
		added(orginalLocation) {
			if (orginalLocation.proposed) {
				// The map widget does not reactively update markers when their
				// flags change. So we remove the propsed marker it added and
				// replace it by a main one. This is only a little weird.
				instance.locationTracker.markers.remove({ proposed: true });

				const location = {
					...orginalLocation,
					main: true,
					draggable: true,
					proposed: undefined,
				};
				instance.locationTracker.markers.insert(location);
			}
		},

		changed(location) {
			if (location.remove) {
				instance.locationTracker.markers.remove(location._id);
			}
		},
	});
});

Template.regionEdit.helpers({
	regionMarkers() {
		return Template.instance().locationTracker.markers;
	},

	timezones() {
		return moment.tz.names();
	},

	isCurrentTimezone(timezone) {
		return Template.instance().data.region.tz === timezone;
	},

	allowPlacing() {
		const { locationTracker } = Template.instance();

		// We return a function so the reactive dependency on locationState is
		// established from within the map template which will call it.
		return () =>
			// We only allow placing if we don't have a selected location yet
			!locationTracker.markers.findOne({ main: true });
	},

	allowRemoving() {
		const { locationTracker } = Template.instance();

		return () => locationTracker.markers.findOne({ main: true });
	},
});

Template.regionEdit.events({
	submit(event, instance) {
		event.preventDefault();

		const changes = {
			tenant: instance.data.region.tenant,
			name: instance.$('.js-name').val(),
			tz: instance.$('.js-timezone').val(),
		};

		if (!changes.name) {
			Alert.error(mf('region.create.plsGiveName', 'Please give your region a name'));
			return;
		}

		const marker = instance.locationTracker.markers.findOne({ main: true });
		if (marker) {
			changes.loc = marker.loc;
		} else {
			Alert.error(mf('region.create.plsSelectPointOnMap', 'Please select a point on the map'));
			return;
		}

		instance.busy('saving');
		SaveAfterLogin(
			instance,
			mf('loginAction.saveRegion', 'Login and save region'),
			mf('registerAction.saveRegion', 'Register and save region'),
			async () => {
				try {
					const res = await RegionsMethods.create(changes);

					Alert.success(
						mf(
							'region.saving.success',
							{ NAME: changes.name },
							'Saved changes to region "{NAME}".',
						),
					);

					Router.go('regionDetails', { _id: res });
				} catch (err) {
					Alert.serverError(err, mf('region.saving.error', 'Saving the region went wrong'));
				} finally {
					instance.busy(false);
				}
			},
		);
	},

	'click .js-edit-cancel'(_event, instance) {
		Router.go('tenantDetails', { _id: instance.data.region.tenant });
	},
});

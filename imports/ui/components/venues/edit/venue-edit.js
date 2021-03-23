

import { Router } from 'meteor/iron:router';
import { mf } from 'meteor/msgfmt:core';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import Alert from '/imports/api/alerts/alert';
import Regions from '/imports/api/regions/regions';
import Venues from '/imports/api/venues/venues';

import CleanedRegion from '/imports/ui/lib/cleaned-region';
import Editable from '/imports/ui/lib/editable';
import LocationTracker from '/imports/ui/lib/location-tracker';
import SaveAfterLogin from '/imports/ui/lib/save-after-login';
import Analytics from '/imports/ui/lib/analytics';

import '/imports/ui/components/buttons/buttons';
import '/imports/ui/components/editable/editable';
import '/imports/ui/components/map/map';

import './venue-edit.html';

Template.venueEdit.onCreated(function () {
	const instance = this;

	instance.busy(false);

	instance.showAdditionalInfo = new ReactiveVar(false);
	instance.isNew = !this.data._id;

	instance.locationTracker = LocationTracker();
	instance.locationTracker.setLocation(this.data, true);

	instance.selectedRegion = new ReactiveVar();
	instance.regionSelectable = new ReactiveVar(false);
	if (instance.isNew) {
		instance.autorun(() => {
			// If the session sets the region, we use it
			const sessionRegion = CleanedRegion(Session.get('region'));

			instance.selectedRegion.set(sessionRegion);

			// If the session does not give us a region, we let the user select it
			instance.regionSelectable.set(!sessionRegion);
		});
	} else {
		// For existing venues the region is already selected and cannot
		// be changed

		instance.selectedRegion.set(this.data.region);
	}

	instance.autorun(() => {
		const regionId = instance.selectedRegion.get();
		instance.locationTracker.setRegion(regionId);
	});

	instance.locationTracker.markers.find().observe({
		added(mark) {
			if (mark.proposed) {
				// The map widget does not reactively update markers when their
				// flags change. So we remove the propsed marker it added and
				// replace it by a main one. This is only a little weird.
				instance.locationTracker.markers.remove({ proposed: true });

				/* eslint-disable-next-line no-param-reassign */
				mark.main = true;
				/* eslint-disable-next-line no-param-reassign */
				mark.draggable = true;
				/* eslint-disable-next-line no-param-reassign */
				delete mark.proposed;
				instance.locationTracker.markers.insert(mark);
			}
		},

		changed(mark) {
			if (mark.remove) {
				instance.locationTracker.markers.remove(mark._id);
			}
		},
	});

	instance.editableDescription = new Editable(
		false,
		false,
		mf('venue.edit.description.placeholder', 'Some words about this venue'),
		false,
	);

	instance.autorun(() => {
		const data = Template.currentData();
		data.editableDescription = instance.editableDescription;
		instance.editableDescription.setText(data.description);
	});
});

Template.venueEdit.helpers({
	displayAdditionalInfo() {
		return {
			style: `display: ${Template.instance().showAdditionalInfo.get() ? 'block' : 'none'}`,
		};
	},

	showAdditionalInfo() {
		return Template.instance().showAdditionalInfo.get();
	},

	regions() {
		return Regions.find();
	},

	showMapSelection() {
		return Template.instance().regionSelectable.get()
			|| Boolean(Template.instance().selectedRegion.get());
	},

	regionSelectable() {
		return Template.instance().regionSelectable.get();
	},

	regionSelected() {
		return Boolean(Template.instance().selectedRegion.get());
	},

	venueMarkers() {
		return Template.instance().locationTracker.markers;
	},

	allowPlacing() {
		const { locationTracker } = Template.instance();

		// We return a function so the reactive dependency on locationState is
		// established from within the map template which will call it.
		return function () {
			// We only allow placing if we don't have a selected location yet
			return !locationTracker.markers.findOne({ main: true });
		};
	},

	allowRemoving() {
		const { locationTracker } = Template.instance();

		return function () {
			return locationTracker.markers.findOne({ main: true });
		};
	},
});

Template.venueEdit.events({
	submit(event, instance) {
		event.preventDefault();

		const changes = {
			name: instance.$('.js-name').val(),
			address: instance.$('.js-address').val(),
			route: instance.$('.js-route').val(),
			short: instance.$('.js-short').val(),
			maxPeople: parseInt(instance.$('.js-maxPeople').val(), 10),
			maxWorkplaces: parseInt(instance.$('.js-maxWorkplaces').val(), 10),
			facilities: [],
			otherFacilities: instance.$('.js-otherFacilities').val(),
			website: instance.$('.js-website').val(),
		};

		if (!changes.name) {
			Alert.error(
				mf('venue.create.plsGiveVenueName', 'Please give your venue a name'),
			);
			return;
		}

		changes.description = instance.data.editableDescription.getEdited();

		if (changes.description?.trim().length === 0) {
			Alert.error(
				mf('venue.create.plsProvideDescription', 'Please provide a description for your venue'),
			);
			return;
		}

		Venues.facilityOptions.forEach((facility) => {
			if (instance.$(`.js-${facility}`).prop('checked')) {
				changes.facilities.push(facility);
			}
		});

		if (instance.isNew) {
			changes.region = instance.selectedRegion.get();
			if (!changes.region) {
				Alert.error(
					mf('venue.create.plsSelectRegion', 'Please select a region'),
				);
				return;
			}
		}

		const marker = instance.locationTracker.markers.findOne({ main: true });
		if (marker) {
			changes.loc = marker.loc;
		} else {
			Alert.error(
				mf('venue.create.plsSelectPointOnMap', 'Please select a point on the map'),
			);
			return;
		}

		const venueId = this._id || '';
		instance.busy('saving');
		SaveAfterLogin(instance,
			mf('loginAction.saveVenue', 'Login and save venue'),
			mf('registerAction.saveVenue', 'Register and save venue'),
			() => {
				Meteor.call('venue.save', venueId, changes, (err, res) => {
					instance.busy(false);
					if (err) {
						Alert.serverError(
							err,
							mf('venue.saving.error', 'Saving the venue went wrong'),
						);
					} else {
						Alert.success(mf('venue.saving.success', { NAME: changes.name }, 'Saved changes to venue "{NAME}".'));

						if (instance.isNew) {
							Analytics.trackEvent('Venue creations', 'Venue creations', Regions.findOne(changes.region)?.nameEn);

							Router.go('venueDetails', { _id: res });
						} else {
							instance.parentInstance().editing.set(false);
						}
					}
				});
			});
	},


	'click .js-toggle-additional-info-btn'(event, instance) {
		instance.showAdditionalInfo.set(!instance.showAdditionalInfo.get());
	},


	'click .js-edit-cancel'(event, instance) {
		if (instance.isNew) {
			Router.go('/');
		} else {
			instance.parentInstance().editing.set(false);
		}
	},

	'change .js-region'(event, instance) {
		instance.selectedRegion.set(instance.$('.js-region').val());
	},
});

Template.venueEditAdditionalInfo.helpers({
	facilitiesCheck(name) {
		const attrs = { class: `js-${name}` };
		if (this.facilities[name]) {
			attrs.checked = 'checked';
		}
		return attrs;
	},
});

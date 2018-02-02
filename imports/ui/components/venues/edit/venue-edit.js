"use strict";
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';

import Regions from '/imports/api/regions/regions.js';
import Venues from '/imports/api/venues/venues.js';
import CleanedRegion from '/imports/ui/lib/cleaned-region.js';
import Editable from '/imports/ui/lib/editable.js';
import LocationTracker from '/imports/ui/lib/location-tracker.js';
import SaveAfterLogin from '/imports/ui/lib/save-after-login.js';
import ShowServerError from '/imports/ui/lib/show-server-error.js';
import { AddMessage } from '/imports/api/messages/methods.js';

import '/imports/ui/components/buttons/buttons.js';
import '/imports/ui/components/editable/editable.js';
import '/imports/ui/components/map/map.js';

import './venue-edit.html';

Template.venueEdit.onCreated(function() {
	var instance = this;

	instance.busy(false);

	instance.showAdditionalInfo = new ReactiveVar(false);
	instance.isNew = !this.data._id;

	instance.locationTracker = LocationTracker();
	instance.locationTracker.setLocation(this.data, true);

	instance.selectedRegion = new ReactiveVar();
	instance.regionSelectable = new ReactiveVar(false);
	if (instance.isNew) {
		instance.autorun(function() {
			// If the session sets the region, we use it
			var sessionRegion = CleanedRegion(Session.get('region'));

			instance.selectedRegion.set(sessionRegion);

			// If the session does not give us a region, we let the user select it
			instance.regionSelectable.set(!sessionRegion);
		});
	} else {
		// For existing venues the region is already selected and cannot
		// be changed

		instance.selectedRegion.set(this.data.region);
	}

	instance.autorun(function() {
		var regionId = instance.selectedRegion.get();
		instance.locationTracker.setRegion(regionId);
	});

	instance.locationTracker.markers.find().observe({
		added: function(mark) {
			if (mark.proposed) {
				// The map widget does not reactively update markers when their
				// flags change. So we remove the propsed marker it added and
				// replace it by a main one. This is only a little weird.
				instance.locationTracker.markers.remove({ proposed: true });

				mark.main = true;
				mark.draggable = true;
				delete mark.proposed;
				instance.locationTracker.markers.insert(mark);
			}
		},

		changed: function(mark) {
			if (mark.remove) {
				instance.locationTracker.markers.remove(mark._id);
			}
		}
	});

	instance.editableDescription = new Editable(
		false,
		false,
		mf('venue.edit.description.placeholder', 'Some words about this venue'),
		false
	);

	instance.autorun(function() {
		var data = Template.currentData();
		data.editableDescription = instance.editableDescription;
		instance.editableDescription.setText(data.description);
	});
});

Template.venueEdit.helpers({
	displayAdditionalInfo: function() {
		return {
			style: 'display: '+(Template.instance().showAdditionalInfo.get() ? 'block' : 'none')
		};
	},

	showAdditionalInfo: function() {
		return Template.instance().showAdditionalInfo.get();
	},

	regions: function(){
		return Regions.find();
	},

	showMapSelection: function() {
		return Template.instance().regionSelectable.get() || !!Template.instance().selectedRegion.get();
	},

	regionSelectable: function() {
		return Template.instance().regionSelectable.get();
	},

	regionSelected: function() {
		return !!Template.instance().selectedRegion.get();
	},

	venueMarkers: function() {
		return Template.instance().locationTracker.markers;
	},

	allowPlacing: function() {
		var locationTracker = Template.instance().locationTracker;

		// We return a function so the reactive dependency on locationState is
		// established from within the map template which will call it.
		return function() {
			// We only allow placing if we don't have a selected location yet
			return !locationTracker.markers.findOne({ main: true });
		};
	},

	allowRemoving: function() {
		var locationTracker = Template.instance().locationTracker;

		return function() {
			return locationTracker.markers.findOne({ main: true });
		};
	}
});

Template.venueEdit.events({
	'submit': function(event, instance) {
		event.preventDefault();

		const changes =
			{ name:            instance.$('.js-name').val()
			, address:         instance.$('.js-address').val()
			, route:           instance.$('.js-route').val()
			, short:           instance.$('.js-short').val()
			, maxPeople:       parseInt(instance.$('.js-maxPeople').val(), 10)
			, maxWorkplaces:   parseInt(instance.$('.js-maxWorkplaces').val(), 10)
			, facilities:      []
			, otherFacilities: instance.$('.js-otherFacilities').val()
			, website:         instance.$('.js-website').val()
		    };

		if (!changes.name) {
			alert(mf('venue.create.plsGiveVenueName', 'Please give your venue a name'));
			return;
		}

		const newDescription = instance.data.editableDescription.getEdited();
		if (newDescription) changes.description = newDescription;

		if (changes.description.trim().length === 0) {
			alert(mf('venue.create.plsProvideDescription', 'Please provide a description for your venue'));
			return;
		}

		Venues.facilityOptions.forEach(facility => {
			if (instance.$(`.js-${facility}`).prop('checked')) {
				changes.facilities.push(facility);
			}
		});

		if (instance.isNew) {
			changes.region = instance.selectedRegion.get();
			if (!changes.region) {
				alert(mf('venue.create.plsSelectRegion', 'Please select a region'));
				return;
			}
		}

		const marker = instance.locationTracker.markers.findOne({ main: true });
		if (marker) {
			changes.loc = marker.loc;
		} else {
			alert(mf('venue.create.plsSelectPointOnMap', 'Please select a point on the map'));
			return;
		}

		const venueId = this._id ? this._id : '';
		instance.busy('saving');
		SaveAfterLogin(instance, mf('loginAction.saveVenue', 'Login and save venue'), () => {
			Meteor.call('venue.save', venueId, changes, (err, res) => {
				instance.busy(false);
				if (err) {
					ShowServerError('Saving the venue went wrong', err);
				} else {
					AddMessage(mf('venue.saving.success', { NAME: changes.name }, 'Saved changes to venue "{NAME}".'), 'success');
					if (instance.isNew) {
						Router.go('venueDetails', { _id: res });
					} else {
						instance.parentInstance().editing.set(false);
					}
				}
			});
		});
	},


	'click .js-toggle-additional-info-btn': function(event, instance) {
		instance.showAdditionalInfo.set(!instance.showAdditionalInfo.get());
	},


	'click .js-edit-cancel': function(event, instance) {
		if (instance.isNew) {
			Router.go('/');
		} else {
			instance.parentInstance().editing.set(false);
		}
	},

	'change .js-region': function(event, instance) {
		instance.selectedRegion.set(instance.$('.js-region').val());
	},
});

Template.venueEditAdditionalInfo.helpers({
	facilitiesCheck: function(name) {
		var attrs = { class: 'js-' + name };
		if (this.facilities[name]) {
			attrs.checked = 'checked';
		}
		return attrs;
	}
});

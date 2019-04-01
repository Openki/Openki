"use strict";

import Regions from '/imports/api/regions/regions.js';
import Venues from '/imports/api/venues/venues.js';

import LocationTracker from '/imports/ui/lib/location-tracker.js';

import '/imports/ui/components/map/map.js';

import './venues-map.html';

Template.venueMap.onCreated(function() {
	var instance = this;

	instance.filter = Venues.Filtering();
	instance.autorun(function() {
		instance.filter.clear();
		instance.filter.add('region', Session.get('region'));
		instance.filter.read(Router.current().params.query);
		instance.filter.done();
	});

	instance.locationTracker = LocationTracker();

	instance.autorun(function() {
		var regionId = Session.get("region");
		instance.locationTracker.setRegion(regionId);
	});

	instance.autorun(function() {
		var query = instance.filter.toQuery();
		instance.subscribe('Venues.findFilter', query);

		// Here we assume venues are not changed or removed.
		instance.locationTracker.markers.remove({});
		Venues.findFilter(query).observe({
			'added'(location) {
				location.proposed = true;
				location.presetName = location.name;
				location.presetAddress = location.address;
				location.preset = true;
				instance.locationTracker.markers.insert(location);
			}
		});
	});
});


Template.venueMap.helpers({

	venues() {
		return Template.instance().locationTracker.markers.find();
	},

	haveVenues() {
		return Template.instance().locationTracker.markers.find().count() > 0;
	},

	venueMarkers() {
		return Template.instance().locationTracker.markers;
	},

	hoverClass() {
		return this.hover ? 'hover' : '';
	},

	regionName() {
		var regionId = Template.instance().filter.get('region');
		var regionObj = Regions.findOne(regionId);
		if (regionObj) return regionObj.name;
		return false;
	}
});


Template.venueMap.events({

	'click .js-location-candidate'(event, instance) {
		Router.go("venueDetails", this);
	},

	'mouseenter .js-location-candidate'(event, instance) {
		instance.locationTracker.markers.update({}, {$set:{hover: false}}, {multi: true});
		instance.locationTracker.markers.update(this._id, {$set:{hover: true}});
	},

	'mouseleave .js-location-candidate'(event, instance) {
		instance.locationTracker.markers.update({}, {$set:{hover: false}}, {multi: true});
	}

});

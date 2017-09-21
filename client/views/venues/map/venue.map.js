"use strict";

import Metatags from '/imports/Metatags.js';

Router.map(function () {
	this.route('venueMap',{
		path: 'venues',
		template: 'venueMap',
		waitOn: function () {
			return Meteor.subscribe('venues', cleanedRegion(Session.get('region')));
		},
		onAfterAction: function() {
			Metatags.setCommonTags(mf('venue.map.windowtitle', 'Venues map'));
		}
	});
});



Template.venueMap.onCreated(function() {
	var instance = this;

	instance.filter = new Filtering(VenuePredicates);
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
		subs.subscribe('venuesFind', query);

		// Here we assume venues are not changed or removed.
		instance.locationTracker.markers.remove({});
		venuesFind(query).observe({
			'added': function(location) {
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

	venues: function() {
		return Template.instance().locationTracker.markers.find();
	},

	haveVenues: function() {
		return Template.instance().locationTracker.markers.find().count() > 0;
	},

	venueMarkers: function() {
		return Template.instance().locationTracker.markers;
	},

	hoverClass: function() {
		return this.hover ? 'hover' : '';
	},

	regionName: function() {
		var regionId = Template.instance().filter.get('region');
		var regionObj = Regions.findOne(regionId);
		if (regionObj) return regionObj.name;
		return false;
	}
});


Template.venueMap.events({

	'click .js-location-candidate': function(event, instance) {
		Router.go("venueDetails", this);
	},

	'mouseenter .js-location-candidate': function(event, instance) {
		instance.locationTracker.markers.update({}, {$set:{hover: false}}, {multi: true});
		instance.locationTracker.markers.update(this._id, {$set:{hover: true}});
	},

	'mouseleave .js-location-candidate': function(event, instance) {
		instance.locationTracker.markers.update({}, {$set:{hover: false}}, {multi: true});
	}

});

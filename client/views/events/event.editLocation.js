"use strict";

Template.eventEditLocation.onCreated(function() {
	var instance = this;
	instance.parent = instance.parentInstance(); // Something, somewhere, must have gone terribly wrong (for this line to exist)

	instance.locationTracker = LocationTracker();
	var location = instance.parentInstance().selectedLocation;

	instance.region = false;
	instance.autorun(function() {
		var regionId = instance.parent.selectedRegion.get();
		instance.region = Regions.findOne(regionId);
		instance.locationTracker.setRegion();
	});

	instance.autorun(function() {
		var location = instance.parent.selectedLocation.get();

		instance.locationTracker.setLocation(location);
	});

	// Tracked so that observe() will be stopped when the template is destroyed
	instance.autorun(function() {
		instance.locationTracker.markers.find({ proposed: true, selected: true }).observe({
			added: function(mark) {
				// When a propsed marker is selected, we clear the other location proposals and
				// store it as new location for the event
				var loc = $.extend(mark, { selected: false, proposed: false });
				var updLocation = instance.parent.selectedLocation.get();
				updLocation.loc = loc;
				instance.parent.selectedLocation.set(updLocation);

				instance.locationTracker.markers.remove({ proposed: true });
			},
		});
	});

	// unset: no location selected
	// preset: one of the preset locations is referenced
	// own: name and coordinates were entered for this event specifically
	instance.locationIs = function(type) {
		var location = instance.parentInstance().selectedLocation.get();
		if (!location) return 'unset' === location;
		if (location._id) return 'preset' === type;
		if (location.name) return 'own' === type;
		return 'unset' === type;
	};

	// Possible states:
	//  show: show the selected location
	//  select: select a predefined location (from Locations)
	//  add: add address and coordinates manually
	instance.locationState = new ReactiveVar('show');
	instance.autorun(function() {
		instance.locationState.set(
			instance.locationIs('unset') ? 'select' : 'show'
		);
	});
});


Template.eventEditLocation.helpers({
	
	locationCandidates: function() {
		return Template.instance().locationTracker.markers.find({ proposed: true });
	},

	locationStateShow: function() {
		return Template.instance().locationState.get() == 'show';
	},

	locationStateSelect: function() {
		return Template.instance().locationState.get() == 'select';
	},

	locationStateAdd: function() {
		return Template.instance().locationState.get() == 'add';
	},

	locationIsSet: function() {
		return !Template.instance().locationIs('unset');
	},

	eventMarkers: function() {
		return Template.instance().locationTracker.markers;
	},

	allowPlacing: function() {
        var locationState = Template.instance().locationState;

        // We return a function so the reactive dependency on locationState is
        // established from within the map template which will call it. The
        // craziness is strong with this one.
        return function() {
            return locationState.get() == 'add';
        }
    }
});


Template.eventEditLocation.events({
	'click .-addressSearch': function(event, instance) {
		var search = instance.$('.-locationAddress').val();
		var nominatimQuery = {
			format: 'json',
			q: search,
			limit: 10,
			polygon_geojson: 1
		};
		var region = instance.region;
		if (region && region.loc) {
			nominatimQuery.viewbox = [
				region.loc.coordinates[0]-0.1,
				region.loc.coordinates[1]+0.1,
				region.loc.coordinates[0]+0.1,
				region.loc.coordinates[1]-0.1,
			].join(',');
			nominatimQuery.bounded = 1;
		}

		var markers = instance.locationTracker.markers;

		HTTP.get('https://nominatim.openstreetmap.org', {
			params:  nominatimQuery
		}, function(error, result) {
			if (error) {
				addMessage(error);
				return;
			}

			var found = JSON.parse(result.content);

			markers.remove({ proposed: true });
			if (found.length == 0) addMessage(mf('event.edit.noResultsforAddress', { ADDRESS: search }, 'Found no results for address "{ADDRESS}"'));
			_.each(found, function(foundLocation) {
				var marker = foundLocation.geojson;
				marker.proposed = true;
				marker.name = foundLocation.display_name;
				instance.locationTracker.markers.insert(marker);
			});
		});
	},

	'click .-locationChange': function(event, instance) {
		var newState = instance.locationIs('own') ? 'add' : 'select';
		instance.locationState.set(newState);
	},

	'click .-locationReset': function(event, instance) {
		instance.locationState.set('show');
	},

	'click .-locationAdd': function(event, instance) {
		instance.locationState.set('add');
	},

	'click .-locationCandidate': function(event, instance) {
		var updLocation = instance.parent.selectedLocation.get();
		updLocation.loc = this;
		instance.parent.selectedLocation.set(updLocation);

		instance.locationTracker.markers.remove({ proposed: true });
	}
});

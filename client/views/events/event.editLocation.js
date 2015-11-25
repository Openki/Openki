"use strict";

Template.eventEditLocation.onCreated(function() {
	var instance = this;
	instance.parent = instance.parentInstance(); // Something, somewhere, must have gone terribly wrong (for this line to exist)

	instance.locationTracker = LocationTracker();
	instance.location = instance.parent.selectedLocation;
	instance.search = new ReactiveVar('');
	instance.addressSearch = new ReactiveVar(false);

	instance.autorun(function() {
		instance.locationTracker.setLocation(instance.location.get());
	});

	instance.autorun(function() {
		var regionId = instance.parent.selectedRegion.get();
		instance.locationTracker.setRegion(regionId);
	});

	// unset: no location selected
	// preset: one of the preset locations is referenced
	// own: name and coordinates were entered for this event specifically
	instance.locationIs = function(type) {
		var location = instance.location.get();
		if (!location) return 'unset' === type;
		if (location._id) return 'preset' === type;
		if (location.name) return 'own' === type;
		return 'unset' === type;
	};

	instance.reset = function() {
		instance.locationTracker.markers.remove({ proposed: true });
	};

	// Set proposed location as new location when it is selected
	instance.autorun(function() {
		instance.locationTracker.markers.find({ proposed: true, selected: true }).observe({
			added: function(mark) {
				// When a propsed marker is selected, we clear the other location proposals and
				// store it as new location for the event
				var updLocation = instance.location.get();
				updLocation.loc = mark.loc;
				if (mark.presetName) updLocation.name = mark.presetName;
				if (mark.preset) {
					updLocation._id = mark._id;
					updLocation.address = mark.address;
				}
				instance.location.set(updLocation);
				instance.locationTracker.markers.remove({ proposed: true });
			},
		});
	});

	instance.autorun(function() {
		// Do not search preset locations when one is already chosen or when
		// searching address
		if (instance.locationIs('preset') || instance.addressSearch.get()) return;

		var search = instance.search.get().trim();
		instance.locationTracker.markers.remove({ proposed: true });

		var query = { region: instance.parent.selectedRegion.get() };

		if (search.length > 0) {
			query.search = search;
		} else {
			query.recent = true;
		}
		var localQuery = _.extend(query, { recent: false } ); // We dont have recent events loaded on the client

		subs.subscribe('locationsFind', query, 5);
		locationsFind(localQuery).observe({
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


Template.eventEditLocation.helpers({
	
	location: function() {
		return Template.instance().location.get();
	},

	locationCandidates: function() {
		return Template.instance().locationTracker.markers.find({ proposed: true });
	},

	locationIsPreset: function() {
		return Template.instance().locationIs('preset');
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
	},

	candidateClass: function() {
		return 'locCandy -locationCandidate' + (this.hover ? ' hover' : '');
	}
});


Template.eventEditLocation.events({
	'click .-addressSearch': function(event, instance) {
		event.preventDefault();

		instance.addressSearch.set(true);
		var search = instance.$('.-locationName').val();
		var nominatimQuery = {
			format: 'json',
			q: search,
			limit: 10,
		};

		var markers = instance.locationTracker.markers;

		var region = markers.findOne({ center: true });
		if (region && region.loc) {
			nominatimQuery.viewbox = [
				region.loc.coordinates[0]-0.1,
				region.loc.coordinates[1]+0.1,
				region.loc.coordinates[0]+0.1,
				region.loc.coordinates[1]-0.1,
			].join(',');
			nominatimQuery.bounded = 1;
		}


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
				var marker = {
					loc: {"type": "Point", "coordinates":[foundLocation.lon, foundLocation.lat]},
					proposed: true,
					address: foundLocation.display_name,
					name: foundLocation.display_name
				};
				instance.locationTracker.markers.insert(marker);
			});
		});
	},

	'click .-locationChange': function(event, instance) {
		instance.location.set({});
		instance.search.set('');
	},

	'click .-locationCandidate': function(event, instance) {
		instance.locationTracker.markers.update(this._id, { $set: { selected: true } });
	},

	'keyup .-locationName': function(event, instance) {
		instance.addressSearch.set(false);
		instance.search.set(event.target.value);

		var updLocation = instance.location.get();
		updLocation.name = event.target.value;
		instance.location.set(updLocation);
	},

	'keyup .-locationAddress': function(event, instance) {
		var updLocation = instance.location.get();
		updLocation.address = event.target.value;
		instance.location.set(updLocation);
	},

	'mouseenter .-locationCandidate': function(event, instance) {
		instance.locationTracker.markers.update({}, {$set:{hover: false}}, {multi: true});
		instance.locationTracker.markers.update(this._id, {$set:{hover: true}});
	},

	'mouseleave .-locationCandidate': function(event, instance) {
		instance.locationTracker.markers.update({}, {$set:{hover: false}}, {multi: true});
	}

});

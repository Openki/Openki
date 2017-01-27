"use strict";

Template.eventEditVenue.onCreated(function() {
	var instance = this;
	instance.parent = instance.parentInstance(); // Something, somewhere, must have gone terribly wrong (for this line to exist)

	instance.locationTracker = LocationTracker();
	instance.location = instance.parent.selectedLocation;
	instance.search = new ReactiveVar('');
	instance.addressSearch = new ReactiveVar(!!instance.location.get().name);

	// unset: no location selected
	// preset: one of the preset locations is referenced
	// own: name and coordinates were entered for this event specifically
	instance.locationIs = function(type) {
		var location = instance.location.get();
		if (!location) return 'unset' === type;
		if (location._id) return 'preset' === type;
		if (location.name || location.loc) return 'own' === type;
		return 'unset' === type;
	};

	instance.autorun(function() {
		var draggable = !instance.locationIs('preset');
		instance.locationTracker.setLocation(instance.location.get(), draggable, draggable);
	});

	instance.autorun(function() {
		var regionId = instance.parent.selectedRegion.get();
		instance.locationTracker.setRegion(regionId);
	});

	instance.reset = function() {
		instance.locationTracker.markers.remove({ proposed: true });
	};

	instance.autorun(function() {
		// Set proposed location as new location when it is selected
		instance.locationTracker.markers.find({ proposed: true, selected: true }).observe({
			added: function(mark) {
				// When a propsed marker is selected, we clear the other location proposals and
				// store it as new location for the event
				var updLocation = instance.location.get();
				updLocation.loc = mark.loc;
				if (mark.presetName) updLocation.name = mark.presetName;
				if (mark.presetAddress) updLocation.address = mark.presetAddress;
				if (mark.preset) {
					updLocation._id = mark._id;
					updLocation.name = mark.presetName;
					updLocation.address = mark.presetAddress;
				}
				instance.locationTracker.markers.remove({ main: true });
				instance.location.set(updLocation);
				instance.addressSearch.set(true); // Ugly hack to banish location proposals
				instance.locationTracker.markers.remove({ proposed: true });
			},
		});

		// Update position if marker was dragged
		instance.locationTracker.markers.find({ main: true }).observe({
			changed: function(mark) {
				var updLocation = instance.location.get();
				if (mark.remove) {
					delete updLocation.loc;
				} else {
					if (_.isEqual(mark.loc, updLocation.loc)) return;
					updLocation.loc = mark.loc;
				}
				instance.location.set(updLocation);
			}
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

		subs.subscribe('venuesFind', query, 10);
		venuesFind(localQuery).observe({
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


Template.eventEditVenue.helpers({

	location: function() {
		return Template.instance().location.get();
	},

	haveLocationCandidates: function() {
		return Template.instance().locationTracker.markers.find({ proposed: true }).count() > 0;
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
		var location = Template.instance().location;

		// We return a function so the reactive dependency on locationState is
		// established from within the map template which will call it. The
		// craziness is strong with this one.
		return function() {
			return !location.get().loc;
		};
	},

	allowRemoving: function() {
		var locationIs = Template.instance().locationIs;
		var location = Template.instance().location;

		return function() {
			return locationIs('own') && location.get().loc;
		};
	},

	hoverClass: function() {
		return this.hover ? 'hover' : '';
	},

	searching: function() {
		return !!Template.instance().location.get().name;
	}

});


Template.eventEditVenue.events({
	'click .js-location-search-btn': function(event, instance) {
		event.preventDefault();

		instance.addressSearch.set(true);
		var search = instance.$('.js-location-search-input').val();
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
			if (found.length === 0) addMessage(mf('event.edit.noResultsforAddress', { ADDRESS: search }, 'Found no results for address "{ADDRESS}"'));
			_.each(found, function(foundLocation) {
				var marker = {
					loc: {"type": "Point", "coordinates":[foundLocation.lon, foundLocation.lat]},
					proposed: true,
					presetAddress: foundLocation.display_name,
					name: foundLocation.display_name
				};
				instance.locationTracker.markers.insert(marker);
			});
		});
	},

	'click .js-location-change': function(event, instance) {
		instance.addressSearch.set(false);
		instance.location.set({});
		instance.search.set('');
	},

	'click .js-location-candidate': function(event, instance) {
		instance.locationTracker.markers.update(this._id, { $set: { selected: true } });
	},

	'keyup .js-location-search-input': function(event, instance) {
		instance.addressSearch.set(false);
		instance.search.set(event.target.value);

		var updLocation = instance.location.get();
		updLocation.name = event.target.value;
		instance.location.set(updLocation);
	},

	'keyup .js-location-address-search': function(event, instance) {
		var updLocation = instance.location.get();
		updLocation.address = event.target.value;
		instance.location.set(updLocation);
	},

	'mouseenter .js-location-candidate': function(event, instance) {
		instance.locationTracker.markers.update({}, {$set:{hover: false}}, {multi: true});
		instance.locationTracker.markers.update(this._id, {$set:{hover: true}});
	},

	'mouseleave .js-location-candidate': function(event, instance) {
		instance.locationTracker.markers.update({}, {$set:{hover: false}}, {multi: true});
	}

});

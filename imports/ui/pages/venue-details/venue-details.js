"use strict";
import Events from '/imports/api/events/events.js';
import Regions from '/imports/api/regions/regions.js';
import Alert from '/imports/api/alerts/alert.js';

import '/imports/ui/components/buttons/buttons.js';
import '/imports/ui/components/events/list/event-list.js';
import '/imports/ui/components/map/map.js';
import '/imports/ui/components/profile-link/profile-link.js';
import '/imports/ui/components/venues/edit/venue-edit.js';

import './venue-details.html';

Template.venueDetails.onCreated(function() {
	var instance = this;
	instance.busy();

	var isNew = !this.data.venue._id;
	this.editing = new ReactiveVar(isNew);
	this.verifyDeleteVenue = new ReactiveVar(false);

	this.increaseBy = 10;
	this.maxEvents = new ReactiveVar(12);
	this.maxPastEvents = new ReactiveVar(3);
	this.eventsCount = new ReactiveVar();
	this.pastEventsCount = new ReactiveVar();

	var markers = new Meteor.Collection(null);
	this.markers = markers;

	this.setLocation = function(loc) {
		markers.remove({ main: true });
		if (loc) {
			markers.insert({
				loc: loc,
				main: true
			});
		}
	};

	this.setRegion = function(region) {
		markers.remove({ center: true });
		if (region && region.loc) {
			markers.insert({
				loc: region.loc,
				center: true
			});
		}
	};

	this.autorun(function() {
		if (!isNew) {
			instance.subscribe('Events.findFilter', { venue: instance.data.venue._id });
		}
	});

	this.getEvents = function(past) {
		if (isNew) return;

		var limit, count;
		var predicate = { venue: this.data.venue._id };
		var now = minuteTime.get();

		if (past) {
			predicate.before = now;
			limit = instance.maxPastEvents.get();
			count = instance.pastEventsCount;
		} else {
			predicate.after = now;
			limit = instance.maxEvents.get();
			count = instance.eventsCount;
		}

		var events = Events.findFilter(predicate).fetch();
		count.set(events.length);
		if (limit) events = events.slice(0, limit);

		return events;
	};

	this.unloadedEvents = function(past) {
		var instance = Template.instance();
		var limit, count;

		if (past) {
			limit = instance.maxPastEvents.get();
			count = instance.pastEventsCount.get();
		} else {
			limit = instance.maxEvents.get();
			count = instance.eventsCount.get();
		}

		var unloaded = count - limit;

		var increaseBy = instance.increaseBy;
		unloaded = (unloaded > increaseBy) ? increaseBy : unloaded;

		return unloaded;
	};
});

Template.venueDetails.onRendered(function() {
	var instance = this;

	instance.busy(false);

	instance.autorun(function() {
		var data = Template.currentData();

		instance.setLocation(data.venue.loc);

		var region = Regions.findOne(data.venue.region);
		instance.setRegion(region);
	});
});


Template.venueDetails.helpers({
	editing() {
		return Template.instance().editing.get();
	},

	mayEdit() {
		return this.editableBy(Meteor.user());
	},

	markers() {
		return Template.instance().markers;
	},

	coords() {
		if (this.loc && this.loc.coordinates) {
			var fmt = function(coord) {
				var sign = '';
				if (coord > 0) sign = '+';
				if (coord < 0) sign = '-';
				return sign + coord.toPrecision(6);
			};
			var coords = {
				LAT: fmt(this.loc.coordinates[1]),
				LON: fmt(this.loc.coordinates[0]),
			};

			return mf('venueDetails.coordinates', coords, "Coordinates: {LAT} {LON}");
		}
	},

	facilityNames() {
		return Object.keys(this.facilities);
	},

	verifyDelete() {
		return Template.instance().verifyDeleteVenue.get();
	},

	events() {
		return Template.instance().getEvents();
	},

	eventsLimited() {
		var instance = Template.instance();
		return instance.eventsCount.get() > instance.maxEvents.get();
	},

	unloadedEvents() {
		return Template.instance().unloadedEvents();
	},

	pastEvents() {
		return Template.instance().getEvents(true);
	},

	pastEventsLimited() {
		var instance = Template.instance();
		return instance.pastEventsCount.get() > instance.maxPastEvents.get();
	},

	unloadedPastEvents() {
		return Template.instance().unloadedEvents(true);
	}
});


Template.venueDetails.events({
	'click .js-venue-edit'(event, instance) {
		instance.editing.set(true);
		instance.verifyDeleteVenue.set(false);
	},

	'click .js-venue-delete'() {
		Template.instance().verifyDeleteVenue.set(true);
	},

	'click .js-venue-delete-cancel'() {
		Template.instance().verifyDeleteVenue.set(false);
	},

	'click .js-venue-delete-confirm'(event, instance) {
		var venue = instance.data.venue;
		instance.busy('deleting');
		Meteor.call('venue.remove', venue._id, function(err, result) {
			instance.busy(false);
			if (err) {
				Alert.error(err, 'Deleting the venue went wrong');
			} else {
				Alert.success(mf('venue.removed', { NAME: venue.name }, 'Removed venue "{NAME}".'));
				Router.go('profile');
			}
		});
	},

	'click .js-show-more-events'(e, instance) {
		var limit = instance.maxEvents;
		limit.set(limit.get() + instance.increaseBy);
	},

	'click .js-show-more-past-events'(e, instance) {
		var limit = instance.maxPastEvents;
		limit.set(limit.get() + instance.increaseBy);
	}
});

"use strict";

/////////////////////////////////////////////////// map

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
		subs.subscribe('eventsFind', { venue: instance.data.venue._id });
	});

	this.getEvents = function(past) {
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

		var events = eventsFind(predicate).fetch();
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
	editing: function () {
		return Template.instance().editing.get();
	},

	mayEdit: function () {
		return this.editableBy(Meteor.user());
	},

	markers: function() {
		return Template.instance().markers;
	},

	coords: function() {
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

	facilityNames: function() {
		return Object.keys(this.facilities);
	},

	verifyDelete: function() {
		return Template.instance().verifyDeleteVenue.get();
	},

	events: function() {
		return Template.instance().getEvents();
	},

	eventsLimited: function() {
		var instance = Template.instance();
		return instance.eventsCount.get() > instance.maxEvents.get();
	},

	unloadedEvents: function() {
		return Template.instance().unloadedEvents();
	},

	pastEvents: function() {
		return Template.instance().getEvents(true);
	},

	pastEventsLimited: function() {
		var instance = Template.instance();
		return instance.pastEventsCount.get() > instance.maxPastEvents.get();
	},

	unloadedPastEvents: function() {
		return Template.instance().unloadedEvents(true);
	}
});


Template.venueDetails.events({
	'click .js-venue-edit': function(event, instance) {
		instance.editing.set(true);
		instance.verifyDeleteVenue.set(false);
	},

	'click .js-venue-delete': function () {
		Template.instance().verifyDeleteVenue.set(true);
	},

	'click .js-venue-delete-cancel': function () {
		Template.instance().verifyDeleteVenue.set(false);
	},

	'click .js-venue-delete-confirm': function(event, instance) {
		var venue = instance.data.venue;
		instance.busy('deleting');
		Meteor.call('venue.remove', venue._id, function(err, result) {
			instance.busy(false);
			if (err) {
				showServerError('Deleting the venue went wrong', err);
			} else {
				addMessage(mf('venue.removed', { NAME: venue.name }, 'Removed venue "{NAME}".'), 'success');
				Router.go('profile');
			}
		});
	},

	'click .js-show-more-events': function(e, instance) {
		var limit = instance.maxEvents;
		limit.set(limit.get() + instance.increaseBy);
	},

	'click .js-show-more-past-events': function(e, instance) {
		var limit = instance.maxPastEvents;
		limit.set(limit.get() + instance.increaseBy);
	}
});

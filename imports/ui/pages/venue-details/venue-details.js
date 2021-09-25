import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { i18n } from '/imports/startup/both/i18next';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { Events } from '/imports/api/events/events';
import { Regions } from '/imports/api/regions/regions';
import * as Alert from '/imports/api/alerts/alert';
import * as VenuesMethods from '/imports/api/venues/methods';

import { reactiveNow } from '/imports/utils/reactive-now';
import { locationFormat } from '/imports/utils/location-format';

import '/imports/ui/components/buttons/buttons';
import '/imports/ui/components/events/list';
import '/imports/ui/components/map/map';
import '/imports/ui/components/profile-link/profile-link';
import '/imports/ui/components/venues/edit/venue-edit';

import './venue-details.html';

Template.venueDetails.onCreated(function () {
	const instance = this;
	instance.busy();

	const isNew = !this.data.venue._id;
	this.editing = new ReactiveVar(isNew);
	this.verifyDeleteVenue = new ReactiveVar(false);

	this.eventLoadingBlockSize = 9;
	this.upcomingEventLimit = new ReactiveVar(12);
	this.pastEventLimit = new ReactiveVar(3);

	const markers = new Meteor.Collection(null); // Local collection for in-memory storage
	this.markers = markers;

	this.setLocation = function (loc) {
		markers.remove({ main: true });
		if (loc) {
			markers.insert({
				loc,
				main: true,
			});
		}
	};

	this.setRegion = function (region) {
		markers.remove({ center: true });
		if (region?.loc) {
			markers.insert({
				loc: region.loc,
				center: true,
			});
		}
	};

	this.autorun(() => {
		if (!isNew) {
			// Add one to the limit so we know there is more to show
			const limit = instance.upcomingEventLimit.get() + 1;

			const now = reactiveNow.get();
			const predicate = {
				venue: instance.data.venue._id,
				after: now,
			};

			instance.subscribe('Events.findFilter', predicate, limit);
		}
	});

	/**
	 * @param {number} limit
	 */
	this.getUpcomingEvents = (limit) => {
		if (isNew) {
			return [];
		}

		const now = reactiveNow.get();
		const filter = {
			venue: instance.data.venue._id,
			after: now,
		};

		return Events.findFilter(filter, limit).fetch();
	};

	this.autorun(() => {
		if (!isNew) {
			// Add one to the limit so we know there is more to show
			const limit = instance.pastEventLimit.get() + 1;

			const now = reactiveNow.get();
			const predicate = {
				venue: instance.data.venue._id,
				before: now,
			};

			instance.subscribe('Events.findFilter', predicate, limit);
		}
	});

	/**
	 * @param {number} limit
	 */
	this.getPastEvents = (limit) => {
		if (isNew) {
			return [];
		}

		const now = reactiveNow.get();
		const filter = {
			venue: instance.data.venue._id,
			before: now,
		};

		return Events.findFilter(filter, limit).fetch();
	};
});

Template.venueDetails.onRendered(function () {
	const instance = this;

	instance.busy(false);

	instance.autorun(() => {
		const data = Template.currentData();

		instance.setLocation(data.venue.loc);

		const region = Regions.findOne(data.venue.region);
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

	/**
	 * @param {{ coordinates: [number, number]; }} loc
	 */
	locationDisplay(loc) {
		return locationFormat(loc);
	},

	facilityNames() {
		return Object.keys(this.facilities);
	},

	verifyDelete() {
		return Template.instance().verifyDeleteVenue.get();
	},

	upcomingEvents() {
		const instance = Template.instance();
		return instance.getUpcomingEvents(instance.upcomingEventLimit.get());
	},

	hasMoreUpcomingEvents() {
		const instance = Template.instance();

		const limit = instance.upcomingEventLimit.get();
		const query = instance.getUpcomingEvents(limit + 1);
		return query.length > limit;
	},

	pastEvents() {
		const instance = Template.instance();
		return instance.getPastEvents(instance.pastEventLimit.get());
	},

	hasMorePastEvents() {
		const instance = Template.instance();

		const limit = instance.pastEventLimit.get();
		const query = instance.getPastEvents(limit + 1);
		return query.length > limit;
	},
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

	async 'click .js-venue-delete-confirm'(event, instance) {
		const { venue } = instance.data;
		instance.busy('deleting');
		try {
			await VenuesMethods.remove(venue._id);

			Alert.success(i18n('venue.removed', 'Removed venue "{NAME}".', { NAME: venue.name }));
			Router.go('profile');
		} catch (err) {
			Alert.serverError(err, 'Deleting the venue went wrong');
		} finally {
			instance.busy(false);
		}
	},

	'click .js-show-more-upcoming-events'(e, instance) {
		const limit = instance.upcomingEventLimit;
		limit.set(limit.get() + instance.eventLoadingBlockSize);
	},

	'click .js-show-more-past-events'(e, instance) {
		const limit = instance.pastEventLimit;
		limit.set(limit.get() + instance.eventLoadingBlockSize);
	},
});

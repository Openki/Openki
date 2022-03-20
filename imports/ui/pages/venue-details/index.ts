import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { ReactiveDict } from 'meteor/reactive-dict';
import { i18n } from '/imports/startup/both/i18next';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';

import { Events, EventModel } from '/imports/api/events/events';
import { Geodata, RegionModel, Regions } from '/imports/api/regions/regions';
import * as Alert from '/imports/api/alerts/alert';
import { VenueModel } from '/imports/api/venues/venues';
import * as VenuesMethods from '/imports/api/venues/methods';

import { reactiveNow } from '/imports/utils/reactive-now';
import { locationFormat } from '/imports/utils/location-format';

import { CenteredMarkerEntity, MainMarkerEntity } from '/imports/ui/lib/location-tracker';

import '/imports/ui/components/buttons';
import '/imports/ui/components/events/list';
import '/imports/ui/components/map';
import '/imports/ui/components/profile-link';
import '/imports/ui/components/venues/edit';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	'venueDetailsPage',
	{ venue: VenueModel },
	{
		eventLoadingBlockSize: number;
		state: ReactiveDict<{
			editing: boolean;
			verifyDelete: boolean;
			upcomingEventLimit: number;
			pastEventLimit: number;
		}>;
		markers: Mongo.Collection<MainMarkerEntity | CenteredMarkerEntity>;
		setLocation: (loc?: Geodata) => void;
		setRegion: (region: RegionModel | undefined) => void;
		getUpcomingEvents: (limit: number) => EventModel[];
		getPastEvents: (limit: number) => EventModel[];
	}
>;

const template = Template.venueDetailsPage;

template.onCreated(function () {
	const instance = this;
	instance.busy();

	this.eventLoadingBlockSize = 9;

	const isNew = !this.data.venue._id;
	this.state = new ReactiveDict();
	this.state.setDefault({
		editing: isNew,
		verifyDelete: false,
		upcomingEventLimit: 12,
		pastEventLimit: 3,
	});

	this.markers = new Mongo.Collection(null); // Local collection for in-memory storage

	this.setLocation = (loc) => {
		this.markers.remove({ main: true });
		if (loc) {
			this.markers.insert({
				loc,
				main: true,
			});
		}
	};

	this.setRegion = (region) => {
		this.markers.remove({ center: true });
		if (region?.loc) {
			this.markers.insert({
				loc: region.loc,
				center: true,
			});
		}
	};

	this.autorun(() => {
		if (isNew) {
			return;
		}

		const limit = instance.state.get('upcomingEventLimit');
		if (limit === undefined) {
			throw new Error('Unexpected undefined: limit');
		}

		const now = reactiveNow.get();
		const predicate = {
			venue: instance.data.venue._id,
			after: now,
		};

		// Add one to the limit so we know there is more to show
		instance.subscribe('Events.findFilter', predicate, limit + 1);
	});

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
		if (isNew) {
			return;
		}

		const limit = instance.state.get('pastEventLimit');
		if (limit === undefined) {
			throw new Error('Unexpected undefined: limit');
		}

		const now = reactiveNow.get();
		const predicate = {
			venue: instance.data.venue._id,
			before: now,
		};

		// Add one to the limit so we know there is more to show
		instance.subscribe('Events.findFilter', predicate, limit + 1);
	});

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

template.onRendered(function () {
	const instance = this;

	instance.busy(false);

	instance.autorun(() => {
		const data = Template.currentData();

		instance.setLocation(data.venue.loc);

		const region = Regions.findOne(data.venue.region || undefined);
		instance.setRegion(region);
	});
});

template.helpers({
	mayEdit() {
		return this.editableBy(Meteor.user());
	},

	markers() {
		return Template.instance().markers;
	},

	locationDisplay(loc: { coordinates: [number, number] }) {
		return locationFormat(loc);
	},

	facilityNames() {
		return Object.keys(this.facilities);
	},

	facilitiesDisplay(name: string) {
		return `venue.facility.${name}`;
	},

	upcomingEvents() {
		const instance = Template.instance();

		const limit = instance.state.get('upcomingEventLimit');
		if (limit === undefined) {
			throw new Error('Unexpected undefined: limit');
		}

		return instance.getUpcomingEvents(limit);
	},

	hasMoreUpcomingEvents() {
		const instance = Template.instance();

		const limit = instance.state.get('upcomingEventLimit');
		if (limit === undefined) {
			throw new Error('Unexpected undefined: limit');
		}

		const query = instance.getUpcomingEvents(limit + 1);
		return query.length > limit;
	},

	pastEvents() {
		const instance = Template.instance();

		const limit = instance.state.get('pastEventLimit');
		if (limit === undefined) {
			throw new Error('Unexpected undefined: limit');
		}

		return instance.getPastEvents(limit);
	},

	hasMorePastEvents() {
		const instance = Template.instance();

		const limit = instance.state.get('pastEventLimit');
		if (limit === undefined) {
			throw new Error('Unexpected undefined: limit');
		}

		const query = instance.getPastEvents(limit + 1);
		return query.length > limit;
	},
});

template.events({
	'click .js-venue-edit'(_event, instance) {
		instance.state.set('editing', true);
		instance.state.set('verifyDelete', false);
	},

	'click .js-venue-delete'() {
		Template.instance().state.set('verifyDelete', true);
	},

	'click .js-venue-delete-cancel'() {
		Template.instance().state.set('verifyDelete', false);
	},

	async 'click .js-venue-delete-confirm'(_event, instance) {
		const { venue } = instance.data;
		instance.busy('deleting');
		try {
			await VenuesMethods.remove(venue._id);

			Alert.success(i18n('venue.removed', 'Removed venue "{NAME}".', { NAME: venue.name }));
			Router.go('profile');
		} catch (err) {
			Alert.serverError(err, i18n('venue.removed.error', 'Deleting the venue went wrong'));
		} finally {
			instance.busy(false);
		}
	},

	'click .js-show-more-upcoming-events'(_event, instance) {
		const limit = instance.state.get('upcomingEventLimit');
		if (limit === undefined) {
			throw new Error('Unexpected undefined: limit');
		}
		instance.state.set('upcomingEventLimit', limit + instance.eventLoadingBlockSize);
	},

	'click .js-show-more-past-events'(_event, instance) {
		const limit = instance.state.get('pastEventLimit');
		if (limit === undefined) {
			throw new Error('Unexpected undefined: limit');
		}
		instance.state.set('pastEventLimit', limit + instance.eventLoadingBlockSize);
	},
});

import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import { Events, EventModel } from '/imports/api/events/events';
import { Geodata, RegionModel, Regions } from '/imports/api/regions/regions';
import * as Alert from '/imports/api/alerts/alert';
import { VenueModel } from '/imports/api/venues/venues';
import * as VenuesMethods from '/imports/api/venues/methods';

import { reactiveNow } from '/imports/utils/reactive-now';
import { i18n } from '/imports/startup/both/i18next';
import * as Metatags from '/imports/utils/metatags';

import { CenteredMarkerEntity, MainMarkerEntity } from '/imports/ui/lib/location-tracker';

import '/imports/ui/components/buttons';
import '/imports/ui/components/events/list';
import '/imports/ui/components/map';
import '/imports/ui/components/profile-link';
import '/imports/ui/components/venues/edit';

import './template.html';
import './styles.scss';

const upcomingEventLimitDefault = 12;
const pastEventLimitDefault = 3;
const eventLoadingBlockSize = 9;

const Template = TemplateAny as TemplateStaticTyped<
	'venueDetailsPage',
	{ venue: VenueModel },
	{
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

	instance.autorun(() => {
		const { venue } = Template.currentData();
		let title;
		if (venue._id) {
			title = venue.name;
		} else {
			title = i18n('venue.edit.siteTitle.create', 'Create Venue');
		}
		Metatags.setCommonTags(title);
	});

	instance.busy();

	instance.state = new ReactiveDict();
	instance.state.setDefault({
		editing: false,
		verifyDelete: false,
		upcomingEventLimit: upcomingEventLimitDefault,
		pastEventLimit: pastEventLimitDefault,
	});

	instance.markers = new Mongo.Collection(null); // Local collection for in-memory storage

	instance.autorun(() => {
		const { venue } = Template.currentData();
		instance.state.set('editing', !venue._id);
	});

	instance.setLocation = (loc) => {
		instance.markers.remove({ main: true });
		if (loc) {
			instance.markers.insert({ loc, main: true });
		}
	};

	instance.setRegion = (region) => {
		instance.markers.remove({ center: true });
		if (region?.loc) {
			instance.markers.insert({ loc: region.loc, center: true });
		}
	};

	instance.autorun(() => {
		const { venue } = Template.currentData();
		if (!venue._id) {
			return;
		}

		const limit = instance.state.get('upcomingEventLimit') || upcomingEventLimitDefault;

		const now = reactiveNow.get();
		const filter = { venue: venue._id, after: now };

		// Add one to the limit so we know there is more to show
		instance.subscribe('Events.findFilter', filter, limit + 1);
	});

	instance.getUpcomingEvents = (limit) => {
		const { venue } = Template.currentData();
		if (!venue._id) {
			return [];
		}

		const now = reactiveNow.get();
		const filter = {
			venue: instance.data.venue._id,
			after: now,
		};

		return Events.findFilter(filter, limit).fetch();
	};

	instance.autorun(() => {
		const { venue } = Template.currentData();
		if (!venue._id) {
			return;
		}

		const limit = instance.state.get('pastEventLimit') || pastEventLimitDefault;

		const now = reactiveNow.get();
		const filter = { venue: venue._id, before: now };

		// Add one to the limit so we know there is more to show
		instance.subscribe('Events.findFilter', filter, limit + 1);
	});
	instance.getPastEvents = (limit) => {
		const { venue } = Template.currentData();
		if (!venue._id) {
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
		const { venue } = Template.currentData();

		instance.setLocation(venue.loc);

		const region = Regions.findOne(venue.region || undefined);
		instance.setRegion(region);
	});
});

template.helpers({
	mayEdit(venue: VenueModel) {
		return venue.editableBy(Meteor.user());
	},

	facilityNames(venue: VenueModel) {
		return Object.keys(venue.facilities);
	},

	facilitiesDisplay(name: string) {
		return i18n(`venue.facility.${name}`);
	},

	upcomingEvents() {
		const instance = Template.instance();
		const limit = instance.state.get('upcomingEventLimit') || 0;
		return instance.getUpcomingEvents(limit);
	},

	hasMoreUpcomingEvents() {
		const instance = Template.instance();

		const limit = instance.state.get('upcomingEventLimit') || 0;
		const query = instance.getUpcomingEvents(limit + 1);
		return query.length > limit;
	},

	pastEvents() {
		const instance = Template.instance();

		const limit = instance.state.get('pastEventLimit') || 0;
		return instance.getPastEvents(limit);
	},

	hasMorePastEvents() {
		const instance = Template.instance();

		const limit = instance.state.get('pastEventLimit') || 0;
		const query = instance.getPastEvents(limit + 1);
		return query.length > limit;
	},
});

template.events({
	'click .js-venue-edit'(_event, instance) {
		instance.state.set('editing', true);
		instance.state.set('verifyDelete', false);
	},

	'click .js-venue-delete'(_event, instance) {
		instance.state.set('verifyDelete', true);
	},

	'click .js-venue-delete-cancel'(_event, instance) {
		instance.state.set('verifyDelete', false);
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
		const limit = instance.state.get('upcomingEventLimit') || 0;
		instance.state.set('upcomingEventLimit', limit + eventLoadingBlockSize);
	},

	'click .js-show-more-past-events'(_event, instance) {
		const limit = instance.state.get('pastEventLimit') || 0;
		instance.state.set('pastEventLimit', limit + eventLoadingBlockSize);
	},
});

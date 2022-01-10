import { Router } from 'meteor/iron:router';
import { i18n } from '/imports/startup/both/i18next';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { _ } from 'meteor/underscore';

import { EventVenueEntity } from '/imports/api/events/events';
import * as Alert from '/imports/api/alerts/alert';
import { FindFilter, VenueEntity, Venues } from '/imports/api/venues/venues';
import { UserModel, Users } from '/imports/api/users/users';

import {
	CenteredMarkerEntity,
	LocationTracker,
	MainMarkerEntity,
	ProposedMarkerEntity,
	RemoveMarkerEntity,
	SelectedMarkerEntity,
} from '/imports/ui/lib/location-tracker';

import '/imports/ui/components/map';
import '/imports/ui/components/venues/link/venue-link';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	'eventEditVenue',
	unknown,
	{
		locationTracker: LocationTracker;
		location: ReactiveVar<Partial<EventVenueEntity>>;
		search: ReactiveVar<string>;
		addressSearch: ReactiveVar<boolean>;
		venueEditor: ReactiveVar<UserModel | false | undefined>;
		locationIs: (type: 'unset' | 'preset' | 'own') => boolean;
		reset: () => void;
	}
>;

const template = Template.eventEditVenue;

template.onCreated(function () {
	const instance = this;
	// Something, somewhere, must have gone terribly wrong (for this line to exist)
	const parent = instance.parentInstance() as any;

	instance.locationTracker = new LocationTracker();
	instance.location = parent.selectedLocation;
	instance.search = new ReactiveVar('');
	instance.addressSearch = new ReactiveVar(Boolean(instance.location.get().name));

	// unset: no location selected
	// preset: one of the preset locations is referenced
	// own: name and coordinates were entered for this event specifically
	instance.locationIs = function (type) {
		const location = instance.location.get();
		if (!location) {
			return type === 'unset';
		}
		if (location._id) {
			return type === 'preset';
		}
		if (location.name || location.loc) {
			return type === 'own';
		}
		return type === 'unset';
	};

	instance.autorun(() => {
		const draggable = !instance.locationIs('preset');
		instance.locationTracker.setLocation(instance.location.get(), draggable, draggable);
	});

	instance.autorun(() => {
		const regionId = parent.selectedRegion.get();
		instance.locationTracker.setRegion(regionId);
	});

	instance.reset = function () {
		instance.locationTracker.markers.remove({ proposed: true });
	};

	instance.autorun(() => {
		// Set proposed location as new location when it is selected
		instance.locationTracker.markers.find({ proposed: true, selected: true }).observe({
			added(mark: ProposedMarkerEntity & SelectedMarkerEntity) {
				// When a propsed marker is selected, we clear the other location proposals and
				// store it as new location for the event
				const updLocation = instance.location.get();
				updLocation.loc = mark.loc;
				if (mark.presetName) {
					updLocation.name = mark.presetName;
				}
				if (mark.presetAddress) {
					updLocation.address = mark.presetAddress;
				}
				if ('preset' in mark && mark.preset) {
					updLocation._id = mark._id;
					updLocation.editor = mark.editor;
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
			changed(mark: MainMarkerEntity | RemoveMarkerEntity) {
				const updLocation = instance.location.get();
				if ('remove' in mark && mark.remove) {
					delete updLocation.loc;
				} else {
					if (_.isEqual(mark.loc, updLocation.loc)) {
						return;
					}
					updLocation.loc = mark.loc;
				}
				instance.location.set(updLocation);
			},
		});
	});

	instance.autorun(() => {
		// Do not search preset locations when one is already chosen or when
		// searching address
		if (instance.locationIs('preset') || instance.addressSearch.get()) {
			return;
		}

		const search = instance.search.get().trim();
		instance.locationTracker.markers.remove({ proposed: true });

		const query: FindFilter = { region: parent.selectedRegion.get() };

		if (search.length > 0) {
			query.search = search;
		} else {
			query.recent = true;
		}
		// We dont have recent events loaded on the client
		const localQuery = _.extend({}, query, { recent: false });

		instance.subscribe('Venues.findFilter', query, 10);
		Venues.findFilter(localQuery).observe({
			added(originalLocation: VenueEntity) {
				const location = {
					...originalLocation,
					proposed: true,
					preset: true,
					presetName: originalLocation.name,
					presetAddress: originalLocation.address,
				} as ProposedMarkerEntity;
				instance.locationTracker.markers.insert(location);
			},
		});
	});

	this.venueEditor = new ReactiveVar(false);
	this.autorun(() => {
		const venueEditor = this.location.get().editor;
		if (venueEditor) {
			this.subscribe('user', venueEditor, () => {
				this.venueEditor.set(Users.findOne(venueEditor));
			});
		}
	});
});

template.helpers({
	location() {
		return Template.instance().location.get();
	},

	haveLocationCandidates() {
		return Template.instance().locationTracker.markers.find({ proposed: true }).count() > 0;
	},

	locationCandidates() {
		return Template.instance().locationTracker.markers.find({ proposed: true });
	},

	locationIsPreset() {
		return Template.instance().locationIs('preset');
	},

	hostProfileLink() {
		return Router.url('userprofile', Template.instance().venueEditor.get());
	},

	eventMarkers() {
		return Template.instance().locationTracker.markers;
	},

	allowPlacing() {
		const { location } = Template.instance();

		// We return a function so the reactive dependency on locationState is
		// established from within the map template which will call it. The
		// craziness is strong with this one.
		return function () {
			return !location.get().loc;
		};
	},

	allowRemoving() {
		const { locationIs } = Template.instance();
		const { location } = Template.instance();

		return function () {
			return locationIs('own') && location.get().loc;
		};
	},

	hoverClass() {
		return this.hover ? 'hover' : '';
	},

	searching() {
		return !!Template.instance().location.get().name;
	},
});

template.events({
	async 'click .js-location-search-btn'(event, instance) {
		event.preventDefault();

		instance.addressSearch.set(true);
		const search = instance.$('.js-location-search-input').val();
		const nominatimQuery: Record<string, any> = {
			format: 'json',
			q: search,
			limit: 10,
		};

		const { markers } = instance.locationTracker;

		const region = markers.findOne({ center: true }) as CenteredMarkerEntity;
		if (region?.loc) {
			nominatimQuery.viewbox = [
				region.loc.coordinates[0] - 0.1,
				region.loc.coordinates[1] + 0.1,
				region.loc.coordinates[0] + 0.1,
				region.loc.coordinates[1] - 0.1,
			].join(',');
			nominatimQuery.bounded = 1;
		}

		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org?${new URLSearchParams(nominatimQuery)}`,
			);
			const found = await response.json();
			markers.remove({ proposed: true });
			if (found.length === 0) {
				Alert.warning(
					i18n('event.edit.noResultsforAddress', 'Found no results for address "{ADDRESS}"', {
						ADDRESS: search,
					}),
				);
			}
			_.each(found, (foundLocation) => {
				const marker = {
					loc: { type: 'Point', coordinates: [foundLocation.lon, foundLocation.lat] },
					proposed: true,
					presetAddress: foundLocation.display_name,
					name: foundLocation.display_name,
				} as ProposedMarkerEntity;
				instance.locationTracker.markers.insert(marker);
			});
		} catch (reason) {
			Alert.serverError(reason, '');
		}
	},

	'click .js-location-change'(_event, instance) {
		instance.addressSearch.set(false);
		instance.location.set({});
		instance.search.set('');
	},

	'click .js-location-candidate'(_event, instance) {
		instance.locationTracker.markers.update(this._id, { $set: { selected: true } });
	},

	'keyup .js-location-search-input'(event, instance) {
		const updLocation = instance.location.get();
		updLocation.name = (event.target as HTMLInputElement).value;
		instance.location.set(updLocation);

		instance.addressSearch.set(false);
		instance.search.set((event.target as HTMLInputElement).value);
	},

	'keyup .js-location-address-search'(event, instance) {
		const updLocation = instance.location.get();
		updLocation.address = (event.target as HTMLInputElement).value;
		instance.location.set(updLocation);
	},

	'mouseenter .js-location-candidate'(_event, instance) {
		instance.locationTracker.markers.update({}, { $set: { hover: false } }, { multi: true });
		instance.locationTracker.markers.update(this._id, { $set: { hover: true } });
	},

	'mouseleave .js-location-candidate'(_event, instance) {
		instance.locationTracker.markers.update({}, { $set: { hover: false } }, { multi: true });
	},
});

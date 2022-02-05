import { Router } from 'meteor/iron:router';
import { i18n } from '/imports/startup/both/i18next';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Session } from 'meteor/session';

import * as Alert from '/imports/api/alerts/alert';
import { Regions } from '/imports/api/regions/regions';
import { VenueModel, Venues } from '/imports/api/venues/venues';
import * as VenuesMethods from '/imports/api/venues/methods';

import CleanedRegion from '/imports/ui/lib/cleaned-region';
import { Editable } from '/imports/ui/lib/editable';
import { LocationTracker, MarkerEntity } from '/imports/ui/lib/location-tracker';
import { SaveAfterLogin } from '/imports/ui/lib/save-after-login';
import { Analytics } from '/imports/ui/lib/analytics';

import '/imports/ui/components/buttons';
import '/imports/ui/components/editable/editable';
import '/imports/ui/components/map';

import './template.html';
import './styles.scss';

{
	const Template = TemplateAny as TemplateStaticTyped<
		'venueEdit',
		VenueModel,
		{
			showAdditionalInfo: ReactiveVar<boolean>;
			isNew: boolean;
			locationTracker: LocationTracker;
			selectedRegion: ReactiveVar<string | undefined | null>;
			regionSelectable: ReactiveVar<boolean>;
			editableDescription: Editable;
		}
	>;

	const template = Template.venueEdit;

	template.onCreated(function () {
		const instance = this;

		instance.busy(false);

		instance.showAdditionalInfo = new ReactiveVar(false);
		instance.isNew = !this.data._id;

		instance.locationTracker = new LocationTracker();
		instance.locationTracker.setLocation(this.data, true);

		instance.selectedRegion = new ReactiveVar(undefined);
		instance.regionSelectable = new ReactiveVar(false);
		if (instance.isNew) {
			instance.autorun(() => {
				// If the session sets the region, we use it
				const sessionRegion = CleanedRegion(Session.get('region'));

				instance.selectedRegion.set(sessionRegion);

				// If the session does not give us a region, we let the user select it
				instance.regionSelectable.set(!sessionRegion);
			});
		} else {
			// For existing venues the region is already selected and cannot
			// be changed
			instance.selectedRegion.set(this.data.region);
		}

		instance.autorun(() => {
			const regionId = instance.selectedRegion.get();
			if (!regionId) {
				return;
			}
			instance.locationTracker.setRegion(regionId);
		});

		instance.locationTracker.markers.find().observe({
			added(orginalLocation) {
				if ('proposed' in orginalLocation && orginalLocation.proposed) {
					// The map widget does not reactively update markers when their
					// flags change. So we remove the propsed marker it added and
					// replace it by a main one. This is only a little weird.
					instance.locationTracker.markers.remove({ proposed: true });

					const location = {
						...orginalLocation,
						main: true,
						draggable: true,
						proposed: undefined,
					} as Mongo.OptionalId<MarkerEntity>;
					instance.locationTracker.markers.insert(location);
				}
			},

			changed(location) {
				if ('remove' in location && location.remove) {
					instance.locationTracker.markers.remove(location._id);
				}
			},
		});

		instance.editableDescription = new Editable(
			false,
			i18n('venue.edit.description.placeholder', 'Some words about this venue'),
		);

		instance.autorun(() => {
			const data = Template.currentData();
			instance.editableDescription.setText(data.description);
		});
	});

	template.helpers({
		displayAdditionalInfo() {
			return {
				style: `display: ${Template.instance().showAdditionalInfo.get() ? 'block' : 'none'}`,
			};
		},

		showAdditionalInfo() {
			return Template.instance().showAdditionalInfo.get();
		},

		showMapSelection() {
			const instance = Template.instance();

			return instance.regionSelectable.get() || !!instance.selectedRegion.get();
		},

		regionSelectable() {
			return Template.instance().regionSelectable.get();
		},

		regionSelected() {
			return !!Template.instance().selectedRegion.get();
		},

		venueMarkers() {
			return Template.instance().locationTracker.markers;
		},

		allowPlacing() {
			const { locationTracker } = Template.instance();

			// We return a function so the reactive dependency on locationState is
			// established from within the map template which will call it.
			return function () {
				// We only allow placing if we don't have a selected location yet
				return !locationTracker.getLocation();
			};
		},

		allowRemoving() {
			const { locationTracker } = Template.instance();

			return function () {
				return locationTracker.getLocation();
			};
		},
	});

	template.events({
		submit(event, instance) {
			event.preventDefault();

			const data = Template.currentData();

			const changes: VenuesMethods.SaveFields = {
				name: instance.$('.js-name').val() as string,
				address: instance.$('.js-address').val() as string,
				route: instance.$('.js-route').val() as string,
				short: instance.$('.js-short').val() as string,
				maxPeople: parseInt(instance.$('.js-maxPeople').val() as string, 10),
				maxWorkplaces: parseInt(instance.$('.js-maxWorkplaces').val() as string, 10),
				facilities: [],
				otherFacilities: instance.$('.js-otherFacilities').val() as string,
			};

			if (!changes.name) {
				Alert.error(i18n('venue.create.plsGiveVenueName', 'Please give your venue a name'));
				return;
			}

			const newDescription = instance.editableDescription.getEdited();
			if (newDescription) {
				changes.description = newDescription;
			}

			if (changes.description?.trim().length === 0) {
				Alert.error(
					i18n('venue.create.plsProvideDescription', 'Please provide a description for your venue'),
				);
				return;
			}

			Venues.facilityOptions.forEach((facility) => {
				if (instance.$(`.js-${facility}`).prop('checked')) {
					(changes.facilities as string[]).push(facility);
				}
			});

			if (instance.isNew) {
				changes.region = instance.selectedRegion.get() || undefined;
				if (!changes.region) {
					Alert.error(i18n('venue.create.plsSelectRegion', 'Please select a region'));
					return;
				}
			}

			const loc = instance.locationTracker.getLocation();
			if (loc) {
				changes.loc = loc;
			} else {
				Alert.error(i18n('venue.create.plsSelectPointOnMap', 'Please select a point on the map'));
				return;
			}

			const venueId = data._id || '';
			instance.busy('saving');
			SaveAfterLogin(
				instance,
				i18n('loginAction.saveVenue', 'Log in and save venue'),
				i18n('registerAction.saveVenue', 'Register and save venue'),
				async () => {
					try {
						const res = await VenuesMethods.save(venueId, changes);

						Alert.success(
							i18n('venue.saving.success', 'Saved changes to venue "{NAME}".', {
								NAME: changes.name,
							}),
						);

						if (instance.isNew) {
							Analytics.trackEvent(
								'Venue creations',
								'Venue creations',
								Regions.findOne(changes.region)?.nameEn,
							);

							Router.go('venueDetails', { _id: res });
						} else {
							(instance.parentInstance() as any).editing.set(false);
						}
					} catch (err) {
						Alert.serverError(err, i18n('venue.saving.error', 'Could not save the venue'));
					} finally {
						instance.busy(false);
					}
				},
			);
		},

		'click .js-toggle-additional-info-btn'(_event, instance) {
			instance.showAdditionalInfo.set(!instance.showAdditionalInfo.get());
		},

		'click .js-edit-cancel'(_event, instance) {
			if (instance.isNew) {
				Router.go('/');
			} else {
				(instance.parentInstance() as any).editing.set(false);
			}
		},

		'change .js-region'(_event, instance) {
			instance.selectedRegion.set(instance.$('.js-region').val() as string);
		},
	});
}
{
	const Template = TemplateAny as TemplateStaticTyped<'venueEditAdditionalInfo', VenueModel>;

	const template = Template.venueEditAdditionalInfo;

	template.helpers({
		facilityOptions() {
			return Venues.facilityOptions;
		},
		facilitiesCheck(name: string) {
			const data = Template.currentData();

			const attrs: {
				class: string;
				type: string;
				value: string;
				checked?: string;
			} = {
				class: `form-check-input js-${name}`,
				type: 'checkbox',
				value: '',
			};
			if (data.facilities[name]) {
				attrs.checked = 'checked';
			}
			return attrs;
		},
		facilitiesDisplay(name: string) {
			return `venue.facility.${name}`;
		},
	});
}

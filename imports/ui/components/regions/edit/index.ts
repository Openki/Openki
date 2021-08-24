import { mf } from 'meteor/msgfmt:core';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import moment from 'moment-timezone';

import { Geodata, RegionEntity } from '/imports/api/regions/regions';

import * as Alert from '/imports/api/alerts/alert';
import { LocationTracker } from '/imports/ui/lib/location-tracker';
import { SaveAfterLogin } from '/imports/ui/lib/save-after-login';

import '/imports/ui/components/buttons/buttons';
import '/imports/ui/components/editable/editable';
import '/imports/ui/components/map/map';

import './template.html';
import './styles.scss';

export interface Data {
	region: RegionEntity;
	title: string;
	onSave: (changes: OnSaveFields) => Promise<void>;
	onCancel: () => void;
}

export interface OnSaveFields {
	name: string;
	tz: string;
	loc: Geodata;
}

{
	const Template = TemplateAny as TemplateStaticTyped<
		Data,
		'regionEdit',
		{ locationTracker: LocationTracker }
	>;

	const template = Template.regionEdit;

	template.onCreated(function () {
		const instance = this;
		instance.busy(false);

		instance.locationTracker = new LocationTracker();
	});

	template.helpers({
		locationTracker() {
			return Template.instance().locationTracker;
		},
	});

	template.events({
		submit(event, instance) {
			event.preventDefault();

			const changes = {
				name: instance.$('.js-name').val(),
				tz: instance.$('.js-timezone').val(),
			} as OnSaveFields;

			if (!changes.name) {
				Alert.error(mf('region.create.plsGiveName', 'Please give your region a name'));
				return;
			}

			const loc = instance.locationTracker.getLocation();
			if (loc) {
				changes.loc = loc;
			} else {
				Alert.error(
					mf(
						'region.create.plsSelectPointOnMap',
						'Please add a marker on the map by clicking on the "+" sign.',
					),
				);
				return;
			}

			instance.busy('saving');
			SaveAfterLogin(
				instance,
				mf('loginAction.saveRegion', 'Login and save region'),
				mf('registerAction.saveRegion', 'Register and save region'),
				async () => {
					try {
						await instance.data.onSave(changes); // from the parent component

						Alert.success(
							mf(
								'region.saving.success',
								{ NAME: changes.name },
								'Saved changes to region "{NAME}".',
							),
						);
					} catch (err) {
						Alert.serverError(err, mf('region.saving.error', 'Saving the region went wrong'));
					} finally {
						instance.busy(false);
					}
				},
			);
		},

		'click .js-edit-cancel'(_event, instance) {
			instance.data.onCancel(); // from the parent component
		},
	});
}
{
	const Template = TemplateAny as TemplateStaticTyped<
		{ locationTracker: LocationTracker; region: RegionEntity },
		'regionEditFields',
		Record<string, unknown>
	>;

	const template = Template.regionEditFields;

	template.onCreated(function () {
		const instance = this;
		instance.busy(false);

		const { locationTracker, region } = instance.data;

		locationTracker.setLocation(region, true);

		locationTracker.markers.find().observe({
			added(orginalLocation) {
				if (orginalLocation.proposed) {
					// The map widget does not reactively update markers when their
					// flags change. So we remove the propsed marker it added and
					// replace it by a main one. This is only a little weird.
					locationTracker.markers.remove({ proposed: true });

					const location = {
						...orginalLocation,
						main: true,
						draggable: true,
						proposed: undefined,
					};
					locationTracker.markers.insert(location);
				}
			},

			changed(location) {
				if (location.remove) {
					locationTracker.markers.remove(location._id);
				}
			},
		});
	});

	template.helpers({
		regionMarkers() {
			return Template.instance().data.locationTracker.markers;
		},

		timezones() {
			return moment.tz.names();
		},

		isCurrentTimezone(timezone: string) {
			return Template.instance().data.region.tz === timezone;
		},

		allowPlacing() {
			const { locationTracker } = Template.instance().data;

			// We return a function so the reactive dependency on locationState is
			// established from within the map template which will call it.
			return () =>
				// We only allow placing if we don't have a selected location yet
				!locationTracker.getLocation();
		},

		allowRemoving() {
			const { locationTracker } = Template.instance().data;

			return () => locationTracker.getLocation();
		},
	});
}

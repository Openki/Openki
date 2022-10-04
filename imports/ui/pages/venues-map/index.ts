import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import { Regions } from '/imports/api/regions/regions';
import { Venues } from '/imports/api/venues/venues';

import { i18n } from '/imports/startup/both/i18next';
import * as Metatags from '/imports/utils/metatags';

import { LocationTracker, MarkerEntity } from '/imports/ui/lib/location-tracker';
import { Filtering } from '/imports/utils/filtering';
import { Predicate } from '/imports/utils/predicates';

import '/imports/ui/components/map';

import './template.html';
import './styles.scss';

{
	const Template = TemplateAny as TemplateStaticTyped<
		'venuesMapPage',
		Record<string, unknown>,
		{
			filter: Filtering<{
				region: Predicate<string, string, string>;
			}>;
			locationTracker: LocationTracker;
		}
	>;

	const template = Template.venuesMapPage;

	template.onCreated(function () {
		const instance = this;

		instance.autorun(() => {
			Metatags.setCommonTags(i18n('venue.map.windowtitle', 'Venues map'));
		});

		instance.filter = Venues.Filtering();
		instance.autorun(() => {
			instance.filter.clear();
			instance.filter.add('region', Session.get('region'));
			instance.filter.read(Router.current().params.query);
			instance.filter.done();
		});

		instance.locationTracker = new LocationTracker();

		instance.autorun(() => {
			const regionId = Session.get('region');
			instance.locationTracker.setRegion(regionId);
		});

		instance.autorun(() => {
			const query = instance.filter.toQuery();
			instance.subscribe('Venues.findFilter', query);

			// Here we assume venues are not changed or removed.
			instance.locationTracker.markers.remove({});
			Venues.findFilter(query).observe({
				added(originalLocation) {
					const location = {
						...originalLocation,
						proposed: true,
						preset: true,
						presetName: originalLocation.name,
						presetAddress: originalLocation.address,
					} as MarkerEntity;
					instance.locationTracker.markers.insert(location);
				},
			});
		});
	});

	template.helpers({
		venues() {
			return Template.instance().locationTracker.markers.find();
		},

		haveVenues() {
			return Template.instance().locationTracker.markers.find().count() > 0;
		},

		venueMarkers() {
			return Template.instance().locationTracker.markers;
		},

		regionName() {
			const regionId = Template.instance().filter.get('region');
			return Regions.findOne(regionId)?.name || false;
		},

		handles() {
			const instance = Template.instance();
			const { markers } = instance.locationTracker;
			return {
				onMouseEnter: (id: string) => {
					markers.update({}, { $set: { hover: false } }, { multi: true });
					markers.update(id, { $set: { hover: true } });
				},
				onMouseLeave: () => {
					markers.update({}, { $set: { hover: false } }, { multi: true });
				},
			};
		},
	});
}

{
	const Template = TemplateAny as TemplateStaticTyped<
		'locationCandidate',
		{
			marker: MarkerEntity;
			handles: { onMouseEnter: (id: string) => void; onMouseLeave: () => void };
		}
	>;

	const template = Template.locationCandidate;

	template.helpers({
		hoverClass() {
			return this.hover ? 'hover' : '';
		},
	});

	template.events({
		'click .js-location-candidate'(_event, instance) {
			Router.go('venueDetails', instance.data.marker);
		},

		'mouseenter .js-location-candidate'(_event, instance) {
			instance.data.handles.onMouseEnter(instance.data.marker._id);
		},

		'mouseleave .js-location-candidate'(_event, instance) {
			instance.data.handles.onMouseLeave();
		},
	});
}

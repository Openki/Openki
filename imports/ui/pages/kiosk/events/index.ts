import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import moment from 'moment';

import { Regions } from '/imports/api/regions/regions';
import { Groups } from '/imports/api/groups/groups';
import { Venues } from '/imports/api/venues/venues';

import { PublicSettings } from '/imports/utils/PublicSettings';

import '/imports/ui/components/language-selection/language-selection';

import './template.html';
import './styles.scss';

{
	const Template = TemplateAny as TemplateStaticTyped<
		Record<string, unknown>,
		'kioskEventsPage',
		Record<string, never>
	>;

	const template = Template.kioskEventsPage;

	template.helpers({
		groupShort(groupId: string) {
			const instance = Template.instance();
			instance.subscribe('group', groupId);

			const group = Groups.findOne({ _id: groupId });
			if (group) {
				return group.short;
			}
			return '';
		},
		venueName(venueId: string) {
			const instance = Template.instance();
			instance.subscribe('venueDetails', venueId);

			const venue = Venues.findOne({ _id: venueId });
			if (venue) {
				return venue.name;
			}
			return '';
		},
		showTime() {
			Session.get('seconds');
			return moment().format('LTS');
		},
		showDate() {
			Session.get('seconds');
			return moment().format('LL');
		},

		headerLogo() {
			let headerLogo;

			const currentRegion = Regions.currentRegion();
			if (currentRegion?.custom?.headerLogoKiosk?.src) {
				headerLogo = currentRegion.custom.headerLogoKiosk.src;
			}

			headerLogo = headerLogo || PublicSettings.headerLogoKiosk.src;

			if (!headerLogo) {
				return '';
			}

			if (headerLogo.startsWith('data:image/')) {
				return headerLogo;
			}

			return `/logo/${headerLogo}`;
		},

		headerAlt() {
			const currentRegion = Regions.currentRegion();
			if (currentRegion?.custom?.headerLogoKiosk?.alt) {
				return currentRegion.custom.headerLogoKiosk.alt;
			}

			return PublicSettings.headerLogoKiosk.alt;
		},
	});
}

{
	const Template = TemplateAny as TemplateStaticTyped<
		Record<string, unknown>,
		'kioskEvent',
		Record<string, never>
	>;

	const template = Template.kioskEvent;
	template.helpers({
		timePeriod() {
			return (Template.instance().parentInstance() as any).data.timePeriod;
		},

		isOngoing() {
			return (Template.instance().parentInstance() as any).timePeriod === 'ongoing';
		},

		isUpcoming() {
			return (Template.instance().parentInstance() as any).timePeriod === 'upcoming';
		},
	});
}

{
	const Template = TemplateAny as TemplateStaticTyped<
		Record<string, unknown>,
		'kioskEventLocation',
		Record<string, never>
	>;
	const template = Template.kioskEventLocation;
	template.helpers({
		showLocation() {
			// The location is shown when we have a location name and the location is not used as a filter
			return this.location?.name && !Router.current().params.query.location;
		},
	});
}

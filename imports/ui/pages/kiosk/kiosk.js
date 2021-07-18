import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import moment from 'moment';

import { Regions } from '/imports/api/regions/regions';
import { Groups } from '/imports/api/groups/groups';
import { Venues } from '/imports/api/venues/venues';
import '/imports/ui/components/language-selection/language-selection';

import './kiosk.html';

Template.kioskEvents.helpers({
	/**
	 * @param {string} groupId
	 */
	groupShort(groupId) {
		const instance = Template.instance();
		instance.subscribe('group', groupId);

		const group = Groups.findOne({ _id: groupId });
		if (group) {
			return group.short;
		}
		return '';
	},
	/**
	 * @param {string} venueId
	 */
	venueName(venueId) {
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
		const currentRegion = Regions.currentRegion();
		if (currentRegion?.custom?.headerLogoKiosk?.src) {
			return currentRegion.custom.headerLogoKiosk.src;
		}

		if (Meteor.settings.public.headerLogoKiosk?.src) {
			return Meteor.settings.public.headerLogoKiosk.src;
		}
		return '';
	},
	headerAlt() {
		const currentRegion = Regions.currentRegion();
		if (currentRegion?.custom?.headerLogoKiosk?.alt) {
			return currentRegion.custom.headerLogoKiosk.alt;
		}

		if (Meteor.settings.public.headerLogoKiosk?.alt) {
			return Meteor.settings.public.headerLogoKiosk.alt;
		}
		return '';
	},
});

Template.kioskEvent.helpers({
	timePeriod() {
		return Template.instance().parentInstance().data.timePeriod;
	},

	isOngoing() {
		return Template.instance().parentInstance().data.timePeriod === 'ongoing';
	},

	isUpcoming() {
		return Template.instance().parentInstance().data.timePeriod === 'upcoming';
	},
});

Template.kioskEventLocation.helpers({
	showLocation() {
		// The location is shown when we have a location name and the location is not used as a filter
		return this.location?.name && !Router.current().params.query.location;
	},
});

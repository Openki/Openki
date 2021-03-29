import { Accounts } from 'meteor/accounts-base';
import { Session } from 'meteor/session';
import { Meteor } from 'meteor/meteor';

import { Regions } from '/imports/api/regions/regions';
import { Alert } from '/imports/api/alerts/alert';

import IpLocation from '/imports/utils/ip-location';
import { UrlTools } from '/imports/utils/url-tools';

const RegionSelection = {};

/** List of routes that show different results when the region changes.
  */
RegionSelection.regionDependentRoutes = ['home', 'find', 'calendar', 'venueMap', 'groupDetails'];

/** Subscribe to list of regions and configure the regions
  * This checks client storage for a region setting. When there is no previously
  * selected region, we ask the server to do geolocation. If that fails too,
  * we just set the region to 'all regions'. */
RegionSelection.init = function () {
	// We assume the initial onLogin() callback comes before the regions' ready.
	// We have no guarantee for this however!
	Accounts.onLogin(() => {
		const user = Meteor.user();
		if (user) {
			const { regionId } = user.profile;
			if (regionId) {
				try {
					localStorage.setItem('region', regionId);
				} catch (e) {
					Alert.error(e);
				}
				Session.set('region', regionId);
			}
		}
	});

	Meteor.subscribe('Regions', () => {
		const selectors = [Session.get('region'),
			UrlTools.queryParam('region'),
			localStorage?.getItem('region'),
		].filter(Boolean);

		const useAsRegion = function (regionId) {
			if (!regionId) {
				return false;
			}

			// Special case 'all'
			if (regionId === 'all') {
				try {
					localStorage.setItem('region', regionId);
				} catch (e) {
					Alert.error(e);
				}
				Session.set('region', regionId);
				return true;
			}

			// Normal case region ID
			if (Regions.findOne({ _id: regionId })) {
				try {
					localStorage.setItem('region', regionId);
				} catch (e) {
					Alert.error(e);
				}
				Session.set('region', regionId);
				return true;
			}

			// Special case by name so you can do ?region=Spilistan
			const region = Regions.findOne({ name: regionId });
			if (region) {
				try {
					localStorage.setItem('region', region._id);
				} catch (e) {
					Alert.error(e);
				}
				Session.set('region', region._id);
				return true;
			}

			// Ignore invalid region ID
			return false;
		};

		// If any of these regions are usable we stop here
		if (selectors.some(useAsRegion)) {
			return;
		}

		// If no region has been selected previously, we show the splash-screen.
		Session.set('showRegionSplash', selectors.length < 1);

		// Ask geolocation server to place us so the splash-screen has our best
		// guess selected.
		IpLocation.detect((region, reason) => {
			/* eslint-disable-next-line no-console */
			console.log(`Region autodetection: ${reason}`);
			if (region) {
				useAsRegion(region._id);
				return;
			}

			// Give up
			useAsRegion('all');
		});
	});
};

export default RegionSelection;

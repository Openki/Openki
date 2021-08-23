import { Accounts } from 'meteor/accounts-base';
import { Session } from 'meteor/session';
import { Meteor } from 'meteor/meteor';

import { Regions } from '/imports/api/regions/regions';
import * as usersMethods from '/imports/api/users/methods';

import * as UserLocation from '/imports/utils/user-location';
import * as UrlTools from '/imports/utils/url-tools';

/**
 * List of routes that show different results when the region changes.
 */
export const regionDependentRoutes = ['home', 'find', 'calendar', 'venuesMap', 'groupDetails'];

/**
 * @param tenantId the tenant where the region should be.
 */
function useAsRegion(regionIdOrName: string, tenantId?: string) {
	if (!regionIdOrName) {
		return false;
	}

	// Special case 'all'
	if (!tenantId && regionIdOrName === 'all') {
		try {
			localStorage.setItem('region', regionIdOrName);
		} catch {
			// ignore See: https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem#exceptions
		}
		Session.set('region', regionIdOrName);
		return true;
	}

	// Normal case region ID
	if (
		Regions.findOne(tenantId ? { tenant: tenantId, _id: regionIdOrName } : { _id: regionIdOrName })
	) {
		try {
			localStorage.setItem('region', regionIdOrName);
		} catch {
			// ignore See: https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem#exceptions
		}
		Session.set('region', regionIdOrName);
		return true;
	}

	// Special case by name so you can do ?region=Spilistan
	const region = Regions.findOne(
		tenantId ? { tenant: tenantId, name: regionIdOrName } : { name: regionIdOrName },
	);
	if (region) {
		try {
			localStorage.setItem('region', region._id);
		} catch {
			// ignore See: https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem#exceptions
		}
		Session.set('region', region._id);
		return true;
	}

	// Ignore invalid region ID
	return false;
}

/**
 * @param preferredTenant On set: Prefer a particular tenant when detection.
 * @param confirmAutodectionByUser On true: Let the user approve the automatic region selection/detection.
 */
export function subscribe(preferredTenant?: string, confirmAutodectionByUser = true) {
	Meteor.subscribe('Regions', async () => {
		const selectors = [
			Session.get('region'),
			UrlTools.queryParam('region'),
			localStorage?.getItem('region'),
		].filter(Boolean);

		if (preferredTenant) {
			// check if we can find a region for a preferred tenant

			if (selectors.some((s) => useAsRegion(s, preferredTenant))) {
				return;
			}

			let preferredTenantRegion;

			try {
				preferredTenantRegion = await UserLocation.detect(preferredTenant);
			} catch (err) {
				// eslint-disable-next-line no-console
				console.log(`Region autodetection error: ${err}`);
			}

			preferredTenantRegion = preferredTenantRegion || Regions.findOne({ preferredTenant });
			if (preferredTenantRegion && useAsRegion(preferredTenantRegion._id)) {
				// found a region for the preferred tenant
				if (confirmAutodectionByUser) {
					Session.set('showRegionSplash', true);
				}
				return;
			}

			// none region found for the preferred tenant use the normal region choose handling
		}

		// If any of these regions are usable we stop here
		if (selectors.some((s) => useAsRegion(s))) {
			return;
		}

		// If no region has been selected previously, we show the splash-screen.

		let region;
		try {
			// Ask geolocation server to place us so the splash-screen has our best
			// guess selected.
			region = await UserLocation.detect();
		} catch (err) {
			// eslint-disable-next-line no-console
			console.log(`Region autodetection error: ${err}`);
		}

		if (region) {
			useAsRegion(region._id);
		} else {
			// Give up
			useAsRegion('all');
		}

		if (confirmAutodectionByUser) {
			Session.set('showRegionSplash', true);
		}
	});
}

/**
 * Subscribe to list of regions and configure the regions
 * This checks client storage for a region setting. When there is no previously
 * selected region, we ask the server to do geolocation. If that fails too,
 * we just set the region to 'all regions'.
 */
export function init() {
	// We assume the initial onLogin() callback comes before the regions' ready.
	// We have no guarantee for this however!
	Accounts.onLogin(() => {
		const user = Meteor.user();
		if (user) {
			const { regionId } = user.profile;
			if (regionId) {
				try {
					localStorage.setItem('region', regionId);
				} catch {
					// ignore See: https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem#exceptions
				}
				Session.set('region', regionId);
			}
		}
	});

	subscribe();
}

export function change(regionId: string) {
	try {
		localStorage.setItem('region', regionId); // to survive page reload
	} catch {
		// ignore See: https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem#exceptions
	}
	Session.set('region', regionId);
	if (regionId !== 'all' && Meteor.userId()) {
		usersMethods.regionChange(regionId);
	}
}

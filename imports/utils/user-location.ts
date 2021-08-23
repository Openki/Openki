import { Meteor as UserLocation } from 'meteor/meteor';

import { Regions } from '/imports/api/regions/regions';

/**
 * Pull location-data from ipinfo.io
 */
export async function getLocation() {
	const response = await fetch('https://ipinfo.io/geo');
	const location = await response.json();

	if (!location.region) {
		throw new Error('IP location not accurate enough');
	}

	const latlon = location.loc.split(',');

	return { type: 'Point', coordinates: [latlon[1], latlon[0]] };
}

export async function detect(tenant?: string) {
	// SPECIAL CASE
	// When we're connected to localhost, it's likely a dev-setup.
	const hostname = document.location?.hostname;
	if (hostname === 'localhost' || hostname.startsWith('127.')) {
		// eslint-disable-next-line no-console
		console.info('Region autodetection: Using Testistan for localhost');
		return Regions.findOne('9JyFCoKWkxnf8LWPh');
	}

	if (UserLocation.settings.testdata) {
		// eslint-disable-next-line no-console
		console.info('Region autodetection: Deployed with testdata, using Spilistan region');
		return Regions.findOne('EZqQLGL4PtFCxCNrp');
	}

	const location = await getLocation();

	const maxDistance = 200000; // meters

	const region = Regions.findOne(
		tenant
			? {
					tenant,
					loc: { $near: { $geometry: location, $maxDistance: maxDistance } },
			  }
			: {
					loc: { $near: { $geometry: location, $maxDistance: maxDistance } },
			  },
	);

	if (!region) {
		if (tenant) {
			throw new Error(`No region found within ${maxDistance / 1000} km for tenant ${tenant}`);
		} else {
			throw new Error(`No region found within ${maxDistance / 1000} km.`);
		}
	}

	return region;
}

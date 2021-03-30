import { Meteor } from 'meteor/meteor';

import { Regions } from '/imports/api/regions/regions';

const IpLocation = {};

IpLocation.detect = function (handler) {
	// SPECIAL CASE
	// When we're connected to localhost, it's likely a dev-setup.
	const hostname = document.location?.hostname;
	if (hostname === 'localhost' || hostname.indexOf('127.') === 0) {
		const testistan = Regions.findOne('9JyFCoKWkxnf8LWPh');
		if (testistan) {
			handler(testistan, 'Using Testistan for localhost');
		}
		return;
	}

	if (Meteor.settings.testdata) {
		const spilistan = Regions.findOne('EZqQLGL4PtFCxCNrp');
		if (spilistan) {
			handler(handler, 'Deployed with testdata, using Spilistan region');
		}
		return;
	}

	// Pull location-data from ipinfo.io
	jQuery.get('https://ipinfo.io/geo', (location) => {
		if (!location.region) {
			handler(false, 'IP location not accurate enough');
			return;
		}

		const maxDistance = 200000; // meters

		const latlon = location.loc.split(',');
		const region = Regions.findOne({
			loc: {
				$near: {
					$geometry: { type: 'Point', coordinates: [latlon[1], latlon[0]] },
					$maxDistance: maxDistance,
				},
			},
		});

		if (region) {
			handler(region, `Found region ${region.name}`);
			return;
		}

		handler(region, `No region found within ${maxDistance / 1000} km.`);
	}, 'jsonp');
};

export default IpLocation;

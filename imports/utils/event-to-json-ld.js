import { Meteor } from 'meteor/meteor';

/** @typedef {import('/imports/api/events/events').EventModel} EventModel */
/** @typedef {import('/imports/api/events/events').Geodata} Geodata */

import { pricePolicyEnabled } from './pricePolicyEnabled';

/**
 * Checks if there is enough data ro make a reasonable jsonLd
 * @param {EventModel} data the event data
 */
function checkJsonLdMinReqs(data) {
	return !!(data.title && data.startLocal && data.endLocal && data.venue);
}

/**
 * @param {Geodata|undefined} data the geo data
 * @return jsonLd geo part
 */
function addGeoToJsonLd(data) {
	if (data?.coordinates?.length === 2) {
		return {
			'@type': 'GeoCoordinates',
			latitude: data.coordinates[1],
			longitude: data.coordinates[0],
		};
	}
	return undefined;
}

/**
 * Add offer information to jsonLd
 *
 * https://developers.google.com/search/docs/data-types/event
 *
 * @return jsonLd-fragment for offers
 */
function addOffersToJsonLd() {
	if (pricePolicyEnabled()) {
		return {
			'@type': 'AggregateOffer',
			price: 'free',
		};
	}

	return undefined;
}
/**
 * Add performer information to jsonLd. use groups as perfomers,
 * if no groups are present createdby is assumed as performer.
 *
 * @return jsonLd-fragment for performer
 */
function addPerformerToJsonLd() {
	return {
		'@type': 'PerformingGroup',
		name: 'co-created',
	};
}

/**
 * Creates the jsonLd
 *
 * @param {EventModel} data - the event data
 * @return jsonLd
 */
function createJsonLd(data) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Event',
		name: data.title,
		startDate: data.startLocal,
		endDate: data.endLocal,
		location: {
			'@type': 'Place',
			address: {
				'@type': 'PostalAddress',
				addressLocality: data.venue.name,
			},
			name: data.venue.name,
			geo: addGeoToJsonLd(data.venue.loc),
		},
		description: data.description || data.title,
		image: Meteor.absoluteUrl(
			`logo/${Meteor.settings.public.ogLogo?.src || 'openki_logo_2018.png'}`,
		),
		offers: addOffersToJsonLd(),
		performer: addPerformerToJsonLd(),
	};
}

/**
 * Adds a jsonLd to the eventDetails html-template
 *
 * @param {EventModel} data the event data
 */
export function appendAsJsonLdToBody(data) {
	if (checkJsonLdMinReqs(data)) {
		$(document).ready(() => {
			const jsonLdTag = document.createElement('script');
			jsonLdTag.type = 'application/ld+json';
			const jsonLd = createJsonLd(data);
			const jsonLdTextNode = document.createTextNode(JSON.stringify(jsonLd, null, 4));
			jsonLdTag.appendChild(jsonLdTextNode);
			$('body').append(jsonLdTag);
		});
	}
}

export default appendAsJsonLdToBody;

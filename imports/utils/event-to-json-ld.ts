import { Meteor } from 'meteor/meteor';

import { EventModel } from '/imports/api/events/events';
import { Geodata } from '/imports/api/regions/regions';

import { PublicSettings } from './PublicSettings';

/**
 * Checks if there is enough data ro make a reasonable jsonLd
 * @param data the event data
 */
function checkJsonLdMinReqs(data: EventModel) {
	return !!(data.title && data.startLocal && data.endLocal && data.venue);
}

/**
 * @param data the geo data
 * @return jsonLd geo part
 */
function addGeoToJsonLd(data: Geodata | undefined) {
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
	if (PublicSettings.pricePolicyEnabled) {
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
 * @param data - the event data
 * @return jsonLd
 */
function createJsonLd(data: EventModel) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Event',
		name: data.title,
		startDate: data.startLocal,
		endDate: data.endLocal,
		location: data.venue
			? {
					'@type': 'Place',
					address: {
						'@type': 'PostalAddress',
						addressLocality: data.venue.name,
					},
					name: data.venue.name,
					geo: addGeoToJsonLd(data.venue.loc),
			  }
			: undefined,
		description: data.description || data.title,
		image: Meteor.absoluteUrl(`logo/${PublicSettings.ogLogo.src}`),
		offers: addOffersToJsonLd(),
		performer: addPerformerToJsonLd(),
	};
}

/**
 * Adds a jsonLd to the eventDetails html-template
 *
 * @param data the event data
 */
export function appendAsJsonLdToBody(data: EventModel) {
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

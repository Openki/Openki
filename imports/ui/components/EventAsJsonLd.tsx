import React from "react";

import { Meteor } from "meteor/meteor";

import { EventModel } from "/imports/api/events/events";
import { Geodata } from "/imports/api/Geodata";

import { PublicSettings } from "/imports/utils/PublicSettings";
import { isOnCustomMap } from "../../utils/isOnCustomMap";

function getSiteDefaultImage() {
  const ogLogo = PublicSettings.ogLogo.src;

  if (ogLogo.startsWith(PublicSettings.s3.publicUrlBase)) {
    // in our s3 file storage
    return ogLogo;
  }

  // in the openki repository folder "public/logo/"
  return Meteor.absoluteUrl(`logo/${ogLogo}`);
}

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
      "@type": "GeoCoordinates",
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
      "@type": "AggregateOffer",
      price: "free",
    };
  }

  return undefined;
}
/**
 * Add performer information to jsonLd.
 *
 * @return jsonLd-fragment for performer
 */
function addPerformerToJsonLd() {
  return {
    "@type": "PerformingGroup",
    name: "co-created",
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
    "@context": "https://schema.org",
    "@type": "Event",
    name: data.title,
    startDate: data.startLocal,
    endDate: data.endLocal,
    location: data.venue
      ? {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: data.venue.name,
          },
          name: data.venue.name,
          geo: !isOnCustomMap(data.venue) ? addGeoToJsonLd(data.venue.loc) : undefined,
        }
      : undefined,
    description: data.description || data.title,
    image: getSiteDefaultImage(),
    offers: addOffersToJsonLd(),
    performer: addPerformerToJsonLd(),
  };
}

export function EventAsJsonLd({ event }: { event: EventModel }) {
  if (!checkJsonLdMinReqs(event)) {
    return null;
  }

  const jsonLd = createJsonLd(event);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 4) }}
    />
  );
}

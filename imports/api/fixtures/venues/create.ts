import { _ } from "meteor/underscore";

import { ensure } from "/imports/api/fixtures/ensureFixture";
import { Prng } from "/imports/api/fixtures/Prng";
import { Regions } from "/imports/api/regions/regions";
import { Venues } from "/imports/api/venues/venues";

import { venues } from "./data";

export function create() {
  const prng = Prng("loadLocations");

  const testRegions = [
    Regions.findOne("9JyFCoKWkxnf8LWPh"),
    Regions.findOne("EZqQLGL4PtFCxCNrp"),
  ].map((r) => {
    if (!r) {
      throw new Error("Unexpected undefined");
    }
    return r._id;
  });

  venues.forEach((v) => {
    const venueData = { ...v };
    venueData.region = prng() > 0.85 ? testRegions[0] : testRegions[1];

    const venue = ensure.venue(venueData.name, venueData.region);

    _.extend(venue, venueData);

    venue.createdby = ensure.user(venue.createdby, venueData.region)._id;

    Venues.update(venue._id, venue);
  });

  return `Inserted ${venues.length} venue fixtures.`;
}

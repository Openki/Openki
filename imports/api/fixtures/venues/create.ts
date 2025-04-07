/* eslint-disable no-await-in-loop */
import { _ } from "meteor/underscore";

import { ensure } from "/imports/api/fixtures/ensureFixture";
import { Prng } from "/imports/api/fixtures/Prng";
import { Regions } from "/imports/api/regions/regions";
import { FacilityOption, Venues } from "/imports/api/venues/venues";

import { venues as venuesBase } from "./data";
import { venues as zuerichlerntVenues } from "./zuerichlernt";
import { Log } from "../../log/log";

export type VenueTemplate = {
  _id?: string;
  name: string;
  region?: string;
  maxPeople?: number;
  maxWorkplaces?: number;
  address: string;
  route?: string;
  slug?: string;
  short?: string;
  loc?: {
    type: string;
    coordinates: number[];
  };
  otherFacilities?: "";
  description?: string;
  website?: string;
  facilities?: Partial<{
    [key in FacilityOption]: boolean;
  }>;
  createdby?: string;
  editor?: string;
  restrictedUse?: boolean;
};

export async function create() {
  const prng = Prng("loadLocations");

  const venues = [...venuesBase, ...zuerichlerntVenues];
  const testRegions = (
    await Promise.all([
      Regions.findOneAsync("9JyFCoKWkxnf8LWPh"),
      Regions.findOneAsync("EZqQLGL4PtFCxCNrp"),
    ])
  ).map((r) => {
    if (!r) {
      throw new Error("Unexpected undefined");
    }
    return r._id;
  });

  for (const template of venues) {
    const venueData = { ...template };
    // eslint-disable-next-line no-nested-ternary
    venueData.region = template.region
      ? template.region
      : prng() > 0.85
      ? testRegions[0]
      : testRegions[1];

    const venue = await ensure.venue(venueData.name, venueData.region, venueData._id);

    _.extend(venue, venueData);

    venue.createdby = (await ensure.user(venue.createdby, venueData.region))._id;
    venue.editor = venue.editor
      ? (await ensure.user(venue.editor, venueData.region))._id
      : (await ensure.user(venue.createdby, venueData.region))._id;

    if (venue.restrictedUse) {
      venue.name += " (only Hosts)";
    }

    await Venues.updateAsync(venue._id, venue);
  }

  Log.record("testdata", ["Venues"], { message: `Inserted ${venues.length} venue fixtures.` });
}

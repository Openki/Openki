/* eslint-disable no-await-in-loop */
import { _ } from "meteor/underscore";

import { ensure } from "/imports/api/fixtures/ensureFixture";
import { Prng } from "/imports/api/fixtures/Prng";
import { Regions } from "/imports/api/regions/regions";
import { FacilityOption, Venues } from "/imports/api/venues/venues";

import { venues as venuesBase } from "./data";
import { venues as zuerichlerntVenues } from "./zuerichlernt";

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
  picture?: string;
  facilities?: Partial<{
    [key in FacilityOption]: boolean;
  }>;
  createdby?: string;
  editor?: string;
};

export async function create() {
  const prng = Prng("loadLocations");

  const venues = [...venuesBase, ...zuerichlerntVenues];
  const testRegions = [
    Regions.findOne("9JyFCoKWkxnf8LWPh"),
    Regions.findOne("EZqQLGL4PtFCxCNrp"),
  ].map((r) => {
    if (!r) {
      throw new Error("Unexpected undefined");
    }
    return r._id;
  });

  for (const v of venues) {
    const venueData = { ...v };
    // eslint-disable-next-line no-nested-ternary
    venueData.region = v.region ? v.region : prng() > 0.85 ? testRegions[0] : testRegions[1];

    const venue = await ensure.venue(venueData.name, venueData.region, venueData._id);

    _.extend(venue, venueData);

    venue.createdby = (await ensure.user(venue.createdby, venueData.region))._id;
    venue.editor = venue.editor
      ? (await ensure.user(venue.editor, venueData.region))._id
      : (await ensure.user(venue.createdby, venueData.region))._id;

    await Venues.updateAsync(venue._id, venue);
  }

  return `Inserted ${venues.length} venue fixtures.`;
}

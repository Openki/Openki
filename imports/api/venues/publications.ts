import { Mongo } from "meteor/mongo";
import { Match, check } from "meteor/check";

import { FindFilter, VenueEntity, Venues } from "/imports/api/venues/venues";

import { ServerPublishMany, ServerPublishOne } from "/imports/utils/ServerPublish";
import { FieldSort } from "/imports/utils/sort-spec";

export const [all, useAll] = ServerPublishMany("venues", (regionId?: string) => {
  check(regionId, Match.Maybe(String));

  const find: Mongo.Selector<VenueEntity> = {};
  if (regionId) {
    find.region = regionId;
  }
  return Venues.find(find);
});

export const [details, useDetails] = ServerPublishOne(
  "venueDetails",
  (venueId: string) => {
    check(venueId, String);

    return Venues.find(venueId);
  },
  function (venueId: string) {
    return Venues.findOne(venueId);
  },
);

export const [findFilter, useFindFilter] = ServerPublishMany(
  "Venues.findFilter",
  (find?: FindFilter, limit?: number, skip?: number, sort?: FieldSort[]) =>
    Venues.findFilter(find, limit, skip, sort),
);

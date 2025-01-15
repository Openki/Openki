import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { Events, FindFilter } from "/imports/api/events/events";

import { AffectedReplicaSelectors } from "/imports/utils/affected-replica-selectors";
import { visibleTenants, visibleTenantsAsync } from "/imports/utils/visible-tenants";
import { ServerPublishMany, ServerPublishOne } from "/imports/utils/ServerPublish";
import { FieldSort } from "/imports/utils/sort-spec";

export const [all, useAll] = ServerPublishMany(
  "events",
  async (region?: string) => {
    check(region, Match.Optional(String));

    if (!region) {
      return Events.find({ tenant: { $in: await visibleTenantsAsync() } });
    }
    return Events.find({ region, tenant: { $in: await visibleTenantsAsync() } });
  },
  (region?) => {
    check(region, Match.Optional(String));

    if (!region) {
      return Events.find({ tenant: { $in: visibleTenants() } });
    }
    return Events.find({ region, tenant: { $in: visibleTenants() } });
  },
);

export const [details, useDetails] = ServerPublishOne(
  "event",
  async (eventId: string) => {
    check(eventId, String);

    return Events.find({ _id: eventId, tenant: { $in: await visibleTenantsAsync() } });
  },
  (eventId) => {
    check(eventId, String);

    return Events.findOne({ _id: eventId, tenant: { $in: visibleTenants() } });
  },
);

export const [findFilter, useFindFilter] = ServerPublishMany(
  "Events.findFilter",
  async (filter?: FindFilter, limit?: number, skip?: number, sort?: FieldSort[]) =>
    Events.findFilter({ ...filter, tenants: await visibleTenantsAsync() }, limit, skip, sort),
  (filter?, limit?, skip?, sort?) =>
    Events.findFilter({ ...filter, tenants: visibleTenants() }, limit, skip, sort),
);

export const [forCourse, useForCourse] = ServerPublishMany(
  "eventsForCourse",
  async (courseId: string) => {
    check(courseId, String);

    return Events.find(
      { courseId, tenant: { $in: await visibleTenantsAsync() } },
      { limit: 200, sort: [["time_created", "desc"]] }, // Hack: https://gitlab.com/Openki/Openki/-/issues/1768
    );
  },
  (courseId) => {
    check(courseId, String);

    return Events.find(
      { courseId, tenant: { $in: visibleTenants() } },
      { limit: 200, sort: [["time_created", "desc"]] }, // Hack: https://gitlab.com/Openki/Openki/-/issues/1768
    );
  },
);

export const [affectedReplica, useAffectedReplica] = ServerPublishMany(
  "affectedReplica",
  async (eventId: string) => {
    check(eventId, String);

    const event = await Events.findOneAsync({
      _id: eventId,
      tenant: {
        $in: await visibleTenantsAsync(),
      },
    });
    if (!event) {
      throw new Meteor.Error(400, `provided event id ${eventId} is invalid`);
    }
    return Events.find(AffectedReplicaSelectors(event));
  },
  (eventId) => {
    check(eventId, String);

    const event = Events.findOne({
      _id: eventId,
      tenant: {
        $in: visibleTenants(),
      },
    });
    if (!event) {
      throw new Meteor.Error(400, `provided event id ${eventId} is invalid`);
    }
    return Events.find(AffectedReplicaSelectors(event));
  },
);

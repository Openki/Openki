import { Mongo } from "meteor/mongo";
import { uniq } from "lodash-es";

import { GroupEntity, GroupModel, Groups } from "../groups/groups";
import { EventEntity, EventModel, Events } from "/imports/api/events/events";
import { Organizations } from "../organizations/organizations";
import { sum } from "../../utils/sum";

export interface Stat {
  groups: {
    /** excl. archived */
    total: number;
    /** no events */
    proposed: number;
    /** with planned event(s) */
    upcoming: number;
    /** only passed events */
    resting: number;
    archived: number;
    /** interested or any role, incl. creator */
    enrollments: number;
    /** unique accounts enrolled */
    users: number;
  };
  events: {
    /** incl. canceled */
    total: number;
    /** excl. canceled */
    future: number;
    /** excl. canceled */
    passed: number;
    /** in future and passed */
    canceled: number;
    /** in future and passed */
    fullyBooked: number;
    /** in future and passed, incl. +1, canceled events excluded */
    totalRsvps: number;
    /** RSVPs in canceled events, incl. +1 and passed */
    canceledRsvps: number;
    /** in future events only, incl. +1, excl. canceled events */
    futureRsvps: number;
    /** unique accounts registered */
    users: number;
  };
}

export interface OrganizationStat extends Stat {
  _id?: string | undefined;
  name?: string | undefined;
  short?: string | undefined;
  members?: number | undefined;
}

export interface Stats {
  region: Stat;
  organizations: OrganizationStat[];
}

function getGroups(regionId: string) {
  const filter: Mongo.Selector<GroupEntity> = {};
  if (regionId && regionId !== "all") {
    filter.region = regionId;
  }
  return Groups.find(filter, {
    // Do not load any data into the memory that is not required
    projection: { name: 0, slug: 0, description: 0, image: 0, customFields: 0, history: 0 },
  }).fetchAsync();
}

function getEvents(regionId: string) {
  const filter: Mongo.Selector<EventEntity> = {};
  if (regionId && regionId !== "all") {
    filter.region = regionId;
  }
  return Events.find(filter, {
    // Do not load any data into the memory that is not required
    projection: { title: 0, slug: 0, description: 0, groupImage: 0, groupCompactImage: 0 },
  }).fetchAsync();
}

/** Get all organizations that promotes groups or events */
async function getOrganizations(groups: GroupModel[], events: EventModel[]) {
  let organizationIds = [];
  organizationIds.push(...groups.flatMap((g) => g.organizations));
  organizationIds.push(...events.flatMap((e) => e.organizations));
  organizationIds = uniq(organizationIds).filter((o) => o);

  const organizationEntities = await Organizations.find(
    {},
    {
      projection: { _id: 1, name: 1, short: 1, members: 1 },
    },
  ).fetchAsync();

  return organizationIds.map((o) => {
    const organization = organizationEntities.find((e) => e._id === o);
    return {
      _id: o,
      name: organization?.name,
      short: organization?.short,
      members: organization?.members.length,
    };
  });
}

function calcStats(groups: GroupModel[], events: EventModel[]): Stat {
  const now = new Date();

  const notArchived = groups.filter((g) => !g.archived);
  const members = groups.flatMap((g) => g.members);

  const notCanceled = events.filter((e) => !e.canceled);
  const canceled = events.filter((e) => e.canceled);
  const futureAndNotCanceled = notCanceled.filter((e) => e.start > now);
  return {
    // inspired from groups.findFilter in /imports/api/groups/groups
    groups: {
      total: notArchived.length,
      proposed: notArchived.filter((g) => g.hasState() === "proposal").length,
      resting: notArchived.filter((g) => g.hasState() === "resting").length,
      upcoming: notArchived.filter((g) => g.hasState() === "upcomingEvent").length,
      archived: groups.filter((g) => g.archived).length,
      enrollments: members.length,
      users: uniq(members.map((m) => m.user)).length,
    },
    // inspired from events.findFilter in /imports/api/events/events
    events: {
      total: events.length,
      future: futureAndNotCanceled.length,
      passed: notCanceled.filter((e) => e.start <= now).length,
      canceled: canceled.length,
      fullyBooked: events.filter((e) => e.isFullyBooked()).length,
      totalRsvps: sum(notCanceled.map((e) => e.numberOfParticipants())),
      canceledRsvps: sum(canceled.map((e) => e.numberOfParticipants())),
      futureRsvps: sum(futureAndNotCanceled.map((e) => e.numberOfParticipants())),
      users: uniq(events.flatMap((e) => e.participants?.map((p) => p.user) || [])).length,
    },
  };
}

export async function getRegionStats(regionId: string): Promise<Stats> {
  // load data into memory
  const groups = await getGroups(regionId);
  const events = await getEvents(regionId);
  const organizations = await getOrganizations(groups, events);

  return {
    // calc stat for overview over all or one region
    region: calcStats(groups, events),
    organizations: [
      // calc stat for groups and events without a organization
      calcStats(
        groups.filter((g) => !g.organizations?.length),
        events.filter((e) => !e.organizations?.length && !e.allOrganizations?.length),
      ),
      // calc stat for every organization
      ...organizations.map((o) => ({
        ...o,
        ...calcStats(
          groups.filter((g) => g.organizations?.includes(o._id)),
          events.filter(
            (e) => e.allOrganizations?.includes(o._id) || e.organizations?.includes(o._id),
          ),
        ),
      })),
    ]
      // sort organizations by number of active users in events
      //        then by number of active users in groups
      //        then by number of events
      //        then by number of groups
      .toSorted((a, b) => b.groups.total + b.groups.archived - (a.groups.total + a.groups.archived))
      .toSorted((a, b) => b.events.total - a.events.total)
      .toSorted((a, b) => b.groups.users - a.groups.users)
      .toSorted((a, b) => b.events.users - a.events.users),
  };
}

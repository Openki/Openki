import { Mongo } from "meteor/mongo";

import { CourseEntity, CourseModel, Courses } from "/imports/api/courses/courses";
import { EventEntity, EventModel, Events } from "/imports/api/events/events";
import { Groups } from "../groups/groups";

export interface Stat {
  courses: {
    total: number;
    proposed: number;
    upcoming: number;
    resting: number;
    archived: number;
    enrolements: number;
    users: number;
  };
  events: {
    total: number;
    future: number;
    passed: number;
    canceled: number;
    fullyBooked: number;
    totalRsvps: number;
    futureRsvps: number;
  };
}

export interface GroupStat extends Stat {
  id?: string | undefined;
  name?: string | undefined;
  members?: number | undefined;
}

export interface Stats {
  region: Stat;
  groups: GroupStat[];
}

function getCourses(regionId: string) {
  const filter: Mongo.Selector<CourseEntity> = {};
  if (regionId && regionId !== "all") {
    filter.region = regionId;
  }
  return Courses.find(filter).fetchAsync();
}

function getEvents(regionId: string) {
  const filter: Mongo.Selector<EventEntity> = {};
  if (regionId && regionId !== "all") {
    filter.region = regionId;
  }
  return Events.find(filter).fetchAsync();
}

async function getGroups(courses: CourseModel[], events: EventModel[]) {
  let groupIds = [];
  groupIds.push(...courses.flatMap((c) => c.groups));
  groupIds.push(...events.flatMap((e) => e.groups));
  groupIds = [...new Set(groupIds)];

  const groupEntities = await Groups.find(
    {},
    {
      projection: { _id: 1, name: 1, members: 1 },
    },
  ).fetchAsync();

  return groupIds.map((g) => {
    const group = groupEntities.find((e) => e._id === g);
    return {
      id: g,
      name: group?.name,
      members: group?.members.length,
    };
  });
}

function calcStats(courses: CourseModel[], events: EventModel[]): Stat {
  const now = new Date();

  const notArchived = courses.filter((c) => !c.archived);
  const members = courses.flatMap((c) => c.members);

  const future = events.filter((e) => e.start > now);
  return {
    // inspired from courses.findFilter in /imports/api/courses/courses
    courses: {
      total: notArchived.length,
      proposed: notArchived.filter((c) => !c.lastEvent && !c.futureEvents).length,
      resting: notArchived.filter((c) => c.lastEvent && !c.futureEvents).length,
      upcoming: notArchived.filter((c) => c.futureEvents > 0).length,
      archived: courses.filter((c) => c.archived).length,
      enrolements: members.flatMap((m) => m.roles).length,
      users: [...new Set(members.map((m) => m.user))].length,
    },
    // inspired from events.findFilter in /imports/api/events/events
    events: {
      total: events.length,
      future: future.length,
      passed: events.filter((e) => e.start <= now).length,
      canceled: events.filter((e) => e.canceled).length,
      fullyBooked: events.filter((e) => e.isFullyBooked()).length,
      totalRsvps: events.map((e) => e.numberOfParticipants()).reduce((a, b) => a + b, 0),
      futureRsvps: future.map((e) => e.numberOfParticipants()).reduce((a, b) => a + b, 0),
    },
  };
}

export async function getRegionStats(regionId: string) {
  // load data into memorie
  const courses = await getCourses(regionId);
  const events = await getEvents(regionId);
  const groups = await getGroups(courses, events);

  return {
    // calc stat for overview over all or one region
    region: calcStats(courses, events),
    groups: [
      // calc stat for ungrouped
      calcStats(
        courses.filter((c) => !c.groups?.length),
        events.filter((e) => !e.groups?.length && !e.allGroups?.length),
      ),
      // calc stat for every group
      ...groups.map(
        (g) =>
          ({
            ...g,
            ...calcStats(
              courses.filter((c) => c.groups?.includes(g.id)),
              events.filter((e) => e.allGroups?.includes(g.id) || e.groups?.includes(g.id)),
            ),
          }) as GroupStat,
      ),
      // sort groups by number of active users
    ].sort((a, b) => b.courses.users - a.courses.users),
  } as Stats;
}

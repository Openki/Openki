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
    enrollments: number;
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
    users: number;
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

/** Remove duplicates in array. */
function unique<T>(values: T[]) {
  return [...new Set(values)];
}

/** Sum all values in a array. */
function sum(values: number[]) {
  return values.reduce((a, b) => a + b, 0);
}

function getCourses(regionId: string) {
  const filter: Mongo.Selector<CourseEntity> = {};
  if (regionId && regionId !== "all") {
    filter.region = regionId;
  }
  return Courses.find(filter, {
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
    projection: { title: 0, slug: 0, description: 0, courseImage: 0 },
  }).fetchAsync();
}

/** Get all groups that promotes courses or events */
async function getGroups(courses: CourseModel[], events: EventModel[]) {
  let groupIds = [];
  groupIds.push(...courses.flatMap((c) => c.groups));
  groupIds.push(...events.flatMap((e) => e.groups));
  groupIds = unique(groupIds).filter((g) => g);

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

  const notCanceled = events.filter((e) => !e.canceled);
  const futureAndNotCanceled = notCanceled.filter((e) => e.start > now);
  return {
    // inspired from courses.findFilter in /imports/api/courses/courses
    courses: {
      total: notArchived.length,
      proposed: notArchived.filter((c) => !c.lastEvent && !c.futureEvents).length,
      resting: notArchived.filter((c) => c.lastEvent && !c.futureEvents).length,
      upcoming: notArchived.filter((c) => c.futureEvents > 0).length,
      archived: courses.filter((c) => c.archived).length,
      enrollments: members.length,
      users: unique(members.map((m) => m.user)).length,
    },
    // inspired from events.findFilter in /imports/api/events/events
    events: {
      total: events.length,
      future: futureAndNotCanceled.length,
      passed: notCanceled.filter((e) => e.start <= now).length,
      canceled: events.filter((e) => e.canceled).length,
      fullyBooked: events.filter((e) => e.isFullyBooked()).length,
      totalRsvps: sum(events.map((e) => e.numberOfParticipants())),
      futureRsvps: sum(futureAndNotCanceled.map((e) => e.numberOfParticipants())),
      users: unique(events.flatMap((e) => e.participants?.map((p) => p.user) || [])).length,
    },
  };
}

export async function getRegionStats(regionId: string): Promise<Stats> {
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
      ...groups.map((g) => ({
        ...g,
        ...calcStats(
          courses.filter((c) => c.groups?.includes(g.id)),
          events.filter((e) => e.allGroups?.includes(g.id) || e.groups?.includes(g.id)),
        ),
      })),
    ]
      // sort groups by number of active users in events
      //        then by number of active users in courses
      //        then by number of events
      //        then by number of courses
      .sort((a, b) => b.courses.total + b.courses.archived - (a.courses.total + a.courses.archived))
      .sort((a, b) => b.events.total - a.events.total)
      .sort((a, b) => b.courses.users - a.courses.users)
      .sort((a, b) => b.events.users - a.events.users),
  };
}

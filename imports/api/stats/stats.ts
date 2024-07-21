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
  };
  events: {
    total: number;
  };
}

export interface GroupStat extends Stat {
  id?: string | undefined;
  name?: string | undefined;
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
      projection: { _id: 1, name: 1 },
    },
  ).fetchAsync();

  return groupIds.map((g) => ({
    id: g,
    name: groupEntities.find((e) => e._id === g)?.name,
  }));
}

function calcStats(courses: CourseModel[], events: EventModel[]) {
  const notArchived = courses.filter((c) => !c.archived);
  return {
    // inspired from courses.findFilter in /imports/api/courses/courses
    courses: {
      total: notArchived.length,
      proposed: notArchived.filter((c) => !c.lastEvent && !c.futureEvents).length,
      resting: notArchived.filter((c) => c.lastEvent && !c.futureEvents).length,
      upcoming: notArchived.filter((c) => c.futureEvents > 0).length,
      archived: courses.filter((c) => c.archived).length,
    },
    // inspired from events.findFilter in /imports/api/events/events
    events: { total: events.length },
  } as Stat;
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
    ],
  } as Stats;
}

import { Mongo } from "meteor/mongo";

import { CourseEntity, Courses } from "/imports/api/courses/courses";
import { EventEntity, Events } from "/imports/api/events/events";

interface Stat {
  courses: {
    total: number;
  };
  events: {
    total: number;
  };
}

export interface Stats {
  region: Stat;
  // groups: ({
  //   id: string | undefined;
  //   name: string | undefined;
  // } & Stat)[];
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

export async function getRegionStats(region: string) {
  const courses = await getCourses(region);
  const events = await getEvents(region);
  return {
    region: {
      courses: { total: courses.filter((c) => !c.archived).length },
      events: { total: events.length },
    },
  } as Stats;
}

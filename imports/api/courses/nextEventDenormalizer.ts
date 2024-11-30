import { Mongo } from "meteor/mongo";

import {
  Courses,
  CourseLastEventEntity,
  CourseNextEventEntity,
  CourseEntity,
} from "/imports/api/courses/courses";
import { Events } from "/imports/api/events/events";

/**
 * Update the nextEvent field for the courses matching the selector
 */
export async function updateNextEvent(courseIdOrSelector: string | Mongo.Selector<CourseEntity>) {
  await Promise.all(
    await Courses.find(courseIdOrSelector).mapAsync(async (course) => {
      const futureEvents = await Events.find({
        courseId: course._id,
        start: { $gt: new Date() },
        canceled: { $ne: true },
      }).countAsync();

      const nextEvent: CourseNextEventEntity | undefined = await Events.findOneAsync(
        { courseId: course._id, start: { $gt: new Date() }, canceled: { $ne: true } },
        {
          sort: { start: 1 },
          projection: {
            startLocal: 1,
            start: 1,
            _id: 1,
            venue: 1,
            noRsvp: 1,
            participants: 1,
          },
        },
      );

      const lastEvent: CourseLastEventEntity | undefined = await Events.findOneAsync(
        { courseId: course._id, start: { $lt: new Date() }, canceled: { $ne: true } },
        {
          sort: { start: -1 },
          projection: {
            startLocal: 1,
            start: 1,
            _id: 1,
            venue: 1,
            participants: 1,
          },
        },
      );

      await Courses.updateAsync(course._id, {
        $set: {
          futureEvents,
          nextEvent: nextEvent || null,
          lastEvent: lastEvent || null,
        },
      });
    }),
  );
}

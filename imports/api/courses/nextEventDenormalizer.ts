import { Mongo } from "meteor/mongo";

import {
  Groups,
  GroupLastEventEntity,
  GroupNextEventEntity,
  GroupEntity,
} from "/imports/api/courses/courses";
import { Events } from "/imports/api/events/events";

/**
 * Update the nextEvent field for the groups matching the selector
 */
export async function updateNextEvent(groupIdOrSelector: string | Mongo.Selector<GroupEntity>) {
  await Promise.all(
    await Groups.find(groupIdOrSelector).mapAsync(async (group) => {
      const futureEvents = await Events.countDocuments({
        courseId: group._id,
        start: { $gt: new Date() },
        canceled: { $ne: true },
      });

      const nextEvent: GroupNextEventEntity | undefined = await Events.findOneAsync(
        { courseId: group._id, start: { $gt: new Date() }, canceled: { $ne: true } },
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

      const lastEvent: GroupLastEventEntity | undefined = await Events.findOneAsync(
        { courseId: group._id, start: { $lt: new Date() }, canceled: { $ne: true } },
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

      await Groups.updateAsync(group._id, {
        $set: {
          futureEvents,
          nextEvent: nextEvent || null,
          lastEvent: lastEvent || null,
        },
      });
    }),
  );
}

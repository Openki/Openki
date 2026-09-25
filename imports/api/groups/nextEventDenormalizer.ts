import { Mongo } from "meteor/mongo";

import { Groups, GroupLastEventRef, GroupNextEventRef, GroupEntity } from "./groups";
import { Events } from "/imports/api/events/events";

/**
 * Update the nextEvent field for the groups matching the selector
 */
export async function updateNextEvent(groupIdOrSelector: string | Mongo.Selector<GroupEntity>) {
  await Promise.all(
    await Groups.find(groupIdOrSelector).mapAsync(async (group) => {
      const futureEvents = await Events.countDocuments({
        groupId: group._id,
        start: { $gt: new Date() },
        canceled: { $ne: true },
      });

      const nextEvent: GroupNextEventRef | undefined = await Events.findOneAsync(
        { groupId: group._id, start: { $gt: new Date() }, canceled: { $ne: true } },
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

      const lastEvent: GroupLastEventRef | undefined = await Events.findOneAsync(
        { groupId: group._id, start: { $lt: new Date() }, canceled: { $ne: true } },
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

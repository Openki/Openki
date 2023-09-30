import { Events } from "/imports/api/events/events";

export function update() {
  let updated = 0;

  Events.find({ participants: { $exists: true } })
    .fetch()
    .forEach((event) => {
      updated += Events.update(
        { _id: event._id },
        {
          $set: {
            participants:
              event.participants?.map((p) => {
                return { user: p as unknown as string };
              }) || [],
          },
        }
      );
    });

  return updated;
}

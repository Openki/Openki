import { Events } from "/imports/api/events/events";

export async function update() {
  let updated = 0;

  for (const event of await Events.find({ participants: { $exists: true } }).fetchAsync()) {
    // eslint-disable-next-line no-await-in-loop
    updated += await Events.updateAsync(
      { _id: event._id },
      {
        $set: {
          participants:
            event.participants?.map((p) => {
              return { user: p as unknown as string } as any;
            }) || [],
        },
      },
    );
  }

  return updated;
}

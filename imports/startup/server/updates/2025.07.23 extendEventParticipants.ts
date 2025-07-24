import { Events } from "/imports/api/events/events";
import { Random } from "meteor/random";

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
              return { ...p, removeToken: Random.secret() };
            }) || [],
        },
      },
    );
  }

  return updated;
}

import { Groups } from "/imports/api/groups/groups";
import { Log } from "/imports/api/log/log";

export async function update() {
  let updated = 0;

  for (const entry of await Log.find({ tr: "Courses.Subscribe" }).fetchAsync()) {
    const { courseId, userId, role } = entry.body as any;

    await Groups.updateAsync(courseId, {
      $addToSet: {
        history: {
          dateTime: entry.ts,
          type: "userSubscribed",
          data: { user: userId, role },
        },
      },
    });
    updated += 1;
  }

  for (const entry of await Log.find({ tr: "Courses.Unsubscribe" }).fetchAsync()) {
    const { courseId, userId, role } = entry.body as any;

    await Groups.updateAsync(courseId, {
      $addToSet: {
        history: {
          dateTime: entry.ts,
          type: "userUnsubscribed",
          data: { user: userId, role },
        },
      },
    });
    updated += 1;
  }

  return updated;
}

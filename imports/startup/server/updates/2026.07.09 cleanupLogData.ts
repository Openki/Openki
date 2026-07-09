import { Log } from "/imports/api/log/log";
import { LogEntity } from "/imports/api/log/factory";

export async function update() {
  let updated = 0;

  const logEntries = (await Log.find({
    tr: { $eq: "Login.Success" },
    body: {
      type: { $eq: "password" },
    },
  }).fetchAsync()) as (LogEntity & { body: { type: string } })[];

  for (const logEntry of logEntries) {
    if (logEntry.body?.type === "password") {
      const updatedLogEntry = {
        ...logEntry,
        body: { ...logEntry.body, $unset: { methodArguments: "" } },
      };
      updated += await Log.updateAsync(logEntry._id, updatedLogEntry);
    }
  }

  return updated;
}

import { Log } from "/imports/api/log/log";
import { LogEntity } from "/imports/api/log/factory";

export async function update() {
  let updated = 0;

  const logEntries = (await Log.find({
    tr: {
      $in: ["Login.Success", "Login.Failure"],
    },
  }).fetchAsync()) as (LogEntity & {
    body: { type: string; methodArguments: Record<any, any>[] };
  })[];

  for (const logEntry of logEntries) {
    if (Array.isArray(logEntry.body?.methodArguments)) {
      const updatedLogEntry = {
        ...logEntry,
        body: {
          ...logEntry.body,
          methodArguments: logEntry.body.methodArguments.map((argument) => {
            delete argument?.password;
            delete argument?.oauth;
          }),
        },
      };
      updated += await Log.updateAsync(logEntry._id, updatedLogEntry);
    }
  }

  return updated;
}

import { Meteor } from "meteor/meteor";
import assignIn from "lodash/assignIn";

import { Version } from "/imports/api/version/version";

import { runBackgroundTasks } from "/imports/utils/background-tasks";

if (runBackgroundTasks)
  Meteor.startup(async () => {
    const runningVersion = await Version.findOneAsync();
    if (
      typeof VERSION !== "undefined" &&
      (!runningVersion ||
        runningVersion.complete !== VERSION.complete ||
        runningVersion.commit !== VERSION.commit)
    ) {
      const newVersion = assignIn(VERSION, {
        activation: new Date(),
      });
      await Version.upsertAsync({}, newVersion);
    }
    await Version.updateAsync({}, { $set: { lastStart: new Date() } });
  });

import { Meteor } from "meteor/meteor";
import { Version } from "/imports/api/version/version";
import { _ } from "meteor/underscore";

import { runBackgroundTasks } from "/imports/utils/background-tasks";

if (runBackgroundTasks)
  Meteor.startup(async () => {
    const runningVersion = await Version.findOneAsync();
    if (
      VERSION !== undefined &&
      (!runningVersion ||
        runningVersion.complete !== VERSION.complete ||
        runningVersion.commit !== VERSION.commit)
    ) {
      const newVersion = _.extend(VERSION, {
        activation: new Date(),
      });
      await Version.upsertAsync({}, newVersion);
    }
    await Version.updateAsync({}, { $set: { lastStart: new Date() } });
  });

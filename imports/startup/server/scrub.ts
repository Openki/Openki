import { Meteor } from "meteor/meteor";
import schedule from "node-schedule";
import moment from "moment";

import { Log } from "/imports/api/log/log";
import { Scrubber } from "/imports/startup/server/lib/scrub";
import { PrivateSettings } from "/imports/utils/PrivateSettings";

import { runBackgroundTasks } from "/imports/utils/background-tasks";

if (runBackgroundTasks)
  Meteor.startup(() => {
    const scrubSettings = PrivateSettings.scrub;
    if (scrubSettings) {
      const scrubber = Scrubber.read(scrubSettings);
      const scrubCall = Meteor.bindEnvironment(() => scrubber.scrub(Log, moment()));

      // Run scrubber at midnight
      const daily = new schedule.RecurrenceRule();
      daily.hour = 0;
      daily.minute = 0;
      schedule.scheduleJob(daily, scrubCall);
    }
  });

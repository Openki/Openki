import { Meteor } from "meteor/meteor";
import schedule from "node-schedule";

import * as groupNextEventDenormalizer from "/imports/api/groups/nextEventDenormalizer";
import * as regionsCountDenormalizer from "/imports/api/regions/countDenormalizer";

import { runBackgroundTasks } from "/imports/utils/background-tasks";
import { serverError } from "/imports/api/log/methods";
import { updateDbCacheFieldsServerOnly } from "/imports/api/db-utilities/updateDbCacheFieldsServerOnly";

if (runBackgroundTasks)
  Meteor.startup(async () => {
    // Update db cache fields every week at sunday at 22:30. That shouldn’t actually be necessary,
    // as the cache – or the calculated field – is usually denormalised when the database is updated.
    // However, there are exceptions, for example, if the data has been modified directly by
    // an administrator using an external tool.
    schedule.scheduleJob(
      { hour: 22, minute: 30, dayOfWeek: 0 /* Sunday */ },
      Meteor.bindEnvironment(async () => {
        await updateDbCacheFieldsServerOnly();
      }),
    );

    Meteor.setInterval(
      async () => {
        try {
          // Update nextEvent for groups where it expired
          await groupNextEventDenormalizer.updateNextEvent({
            "nextEvent.start": { $lt: new Date() },
          });
          await regionsCountDenormalizer.updateCounters({});
        } catch (error) {
          serverError(error);
        }
      },
      60 * 1000, // Check every minute
    );
  });

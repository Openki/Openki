import { Meteor } from "meteor/meteor";
import schedule from "node-schedule";

import * as groupNextEventDenormalizer from "/imports/api/courses/nextEventDenormalizer";
import * as regionsCountDenormalizer from "/imports/api/regions/countDenormalizer";

import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { runBackgroundTasks } from "/imports/utils/background-tasks";
import { serverError } from "/imports/api/log/methods";
import { updateDbCacheFieldsServerOnly } from "/imports/api/db-utilities/updateDbCacheFieldsServerOnly";

if (runBackgroundTasks)
  Meteor.startup(async () => {
    /* Initialize cache-fields on startup (Also called calculated fields or denormalized data) */

    if (PrivateSettings.startup.buildDbCacheAsync) {
      // Run every week at sunday at 22:30
      schedule.scheduleJob(
        { hour: 22, minute: 30, dayOfWeek: 0 /* Sunday */ },
        Meteor.bindEnvironment(async () => {
          await updateDbCacheFieldsServerOnly();
        }),
      );
    } else {
      await updateDbCacheFieldsServerOnly();
    }

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

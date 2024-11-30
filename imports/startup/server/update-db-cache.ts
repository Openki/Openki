import { Meteor } from "meteor/meteor";
import schedule from "node-schedule";

import * as coursesTenantDenormalizer from "/imports/api/courses/tenantDenormalizer";
import * as eventsCategoriesDenormalizer from "/imports/api/events/categoriesDenormalizer";
import * as eventsTenantDenormalizer from "/imports/api/events/tenantDenormalizer";
import * as usersTenantsDenormalizer from "/imports/api/users/tenantsDenormalizer";
import * as courseGroupsDenormalizer from "/imports/api/courses/groupsDenormalizer";
import * as eventsVenueDenormalizer from "/imports/api/events/venueDenormalizer";

import { PrivateSettings } from "/imports/utils/PrivateSettings";
import * as AsyncTools from "/imports/utils/async-tools";
import { runBackgroundTasks } from "/imports/utils/background-tasks";
import { Log } from "/imports/api/log/log";

async function updateDbCacheFields() {
  Log.record("DbCacheFields.Update.Start", [], {});

  // Resync location cache in events
  await eventsVenueDenormalizer.updateVenue({});

  // Update list of organizers per course, triggers updateGroups from events
  await courseGroupsDenormalizer.updateGroups({});

  await eventsCategoriesDenormalizer.onStartUp();

  // Update List of badges per user
  Meteor.call("user.updateBadges", {}, AsyncTools.logErrors);

  await coursesTenantDenormalizer.onStartUp();
  await eventsTenantDenormalizer.onStartUp();
  await usersTenantsDenormalizer.onStartUp();

  // Keep the nextEvent entry updated
  // On startup do a full scan to catch stragglers
  Meteor.call("course.updateNextEvent", {}, AsyncTools.logErrors);
  Meteor.call("region.updateCounters", {}, AsyncTools.logErrors);

  Log.record("DbCacheFields.Update.End", [], {});
}

if (runBackgroundTasks)
  Meteor.startup(async () => {
    /* Initialize cache-fields on startup (Also called calculated fields or denomalized data) */

    if (PrivateSettings.startup.buildDbCacheAsync) {
      // Run every week at sunnday at 22:30
      schedule.scheduleJob(
        { hour: 22, minute: 30, dayOfWeek: 0 /* Sunnday */ },
        Meteor.bindEnvironment(async () => {
          await updateDbCacheFields();
        }),
      );
    } else {
      await updateDbCacheFields();
    }

    Meteor.setInterval(
      () => {
        // Update nextEvent for courses where it expired
        Meteor.call(
          "course.updateNextEvent",
          { "nextEvent.start": { $lt: new Date() } },
          AsyncTools.logErrors,
        );
        Meteor.call("region.updateCounters", {}, AsyncTools.logErrors);
      },
      60 * 1000, // Check every minute
    );
  });

import { Meteor } from "meteor/meteor";
import schedule from "node-schedule";

import { Users } from "/imports/api/users/users";
import * as coursesTenantDenormalizer from "/imports/api/courses/tenantDenormalizer";
import * as eventsCategoriesDenormalizer from "/imports/api/events/categoriesDenormalizer";
import * as eventsTenantDenormalizer from "/imports/api/events/tenantDenormalizer";
import * as usersTenantsDenormalizer from "/imports/api/users/tenantsDenormalizer";

import * as Profile from "/imports/utils/profile";
import { PrivateSettings } from "/imports/utils/PrivateSettings";
import * as AsyncTools from "/imports/utils/async-tools";
import { runBackgroundTasks } from "/imports/utils/background-tasks";
import { Log } from "/imports/api/log/log";

async function updateDbCacheFields() {
  Log.record("DbCacheFields.Update", [], {});

  // Resync location cache in events
  Meteor.call("event.updateVenue", {}, AsyncTools.logErrors);

  // Update list of organizers per course
  Meteor.call("course.updateGroups", {}, AsyncTools.logErrors);

  await eventsCategoriesDenormalizer.onStartUp();

  // Update List of badges per user
  Meteor.call("user.updateBadges", {}, AsyncTools.logErrors);

  await coursesTenantDenormalizer.onStartUp();
  await eventsTenantDenormalizer.onStartUp();
  await usersTenantsDenormalizer.onStartUp();

  // The `acceptsPrivateMessage` field is denormalized via `observe` to keep up to date after a
  // change is made.
  Users.find({}, { projection: { allowPrivateMessages: 1, emails: 1 } }).observe({
    added: Profile.updateAcceptsPrivateMessages,
    changed: Profile.updateAcceptsPrivateMessages,
  });

  // Keep the nextEvent entry updated
  // On startup do a full scan to catch stragglers
  Meteor.call("course.updateNextEvent", {}, AsyncTools.logErrors);
  Meteor.call("region.updateCounters", {}, AsyncTools.logErrors);
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
  });

import { Meteor } from "meteor/meteor";
import schedule from "node-schedule";

import * as coursesTenantDenormalizer from "/imports/api/courses/tenantDenormalizer";
import * as courseGroupsDenormalizer from "/imports/api/courses/groupsDenormalizer";
import * as courseNextEventDenormalizer from "/imports/api/courses/nextEventDenormalizer";
import * as eventsCategoriesDenormalizer from "/imports/api/events/categoriesDenormalizer";
import * as eventsTenantDenormalizer from "/imports/api/events/tenantDenormalizer";
import * as eventsVenueDenormalizer from "/imports/api/events/venueDenormalizer";
import * as usersTenantsDenormalizer from "/imports/api/users/tenantsDenormalizer";
import * as userBadgesDenormalizer from "/imports/api/users/badgesDenormalizer";
import * as regionsCountDenormalizer from "/imports/api/regions/countDenormalizer";

import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { runBackgroundTasks } from "/imports/utils/background-tasks";
import { Log } from "/imports/api/log/log";
import { serverError } from "/imports/api/log/methods";

async function updateDbCacheFields() {
  Log.record("DbCacheFields.Update.Start", [], {});

  try {
    // Resync location cache in events
    await eventsVenueDenormalizer.updateVenue({});

    // Update list of organizers per course, triggers updateGroups from events
    await courseGroupsDenormalizer.updateGroups({});

    await eventsCategoriesDenormalizer.onStartUp();

    // Update List of badges per user
    await userBadgesDenormalizer.updateBadges({});

    await coursesTenantDenormalizer.onStartUp();
    await eventsTenantDenormalizer.onStartUp();
    await usersTenantsDenormalizer.onStartUp();

    // Keep the nextEvent entry updated
    // On startup do a full scan to catch stragglers
    await courseNextEventDenormalizer.updateNextEvent({});
    await regionsCountDenormalizer.updateCounters({});
  } catch (error) {
    serverError(error);
  }
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
      async () => {
        try {
          // Update nextEvent for courses where it expired
          await courseNextEventDenormalizer.updateNextEvent({ $lt: new Date() });
          await regionsCountDenormalizer.updateCounters({});
        } catch (error) {
          serverError(error);
        }
      },
      60 * 1000, // Check every minute
    );
  });

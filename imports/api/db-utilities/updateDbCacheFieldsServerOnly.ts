import * as courseGroupsDenormalizer from "../courses/groupsDenormalizer";
import * as courseNextEventDenormalizer from "../courses/nextEventDenormalizer";
import * as coursesTenantDenormalizer from "../courses/tenantDenormalizer";
import * as eventsCategoriesDenormalizer from "../events/categoriesDenormalizer";
import * as eventsCourseImageDenormalizer from "../events/courseImageDenormalizer";
import * as eventsTenantDenormalizer from "../events/tenantDenormalizer";
import * as eventsVenueDenormalizer from "../events/venueDenormalizer";
import { Log } from "../log/log";
import { serverError } from "../log/methods";
import * as regionsCountDenormalizer from "../regions/countDenormalizer";
import * as userBadgesDenormalizer from "../users/badgesDenormalizer";
import * as usersTenantsDenormalizer from "../users/tenantsDenormalizer";

export async function updateDbCacheFieldsServerOnly() {
  Log.record("DbCacheFields.Update.Start", [], {});

  try {
    await eventsCourseImageDenormalizer.onStartUp();
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

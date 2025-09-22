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
import * as usersVenuesDenormalizer from "../users/venuesDenormalizer";

export async function updateDbCacheFieldsServerOnly() {
  Log.record("DbCacheFields.Update.Start", [], {});

  try {
    await Promise.all([
      eventsCourseImageDenormalizer.onStartUp(),
      // Resync location cache in events
      eventsVenueDenormalizer.updateVenue({}),

      // Update list of organizers per course, triggers updateGroups from events
      courseGroupsDenormalizer.updateGroups({}),

      eventsCategoriesDenormalizer.onStartUp(),

      // Update List of badges per user
      userBadgesDenormalizer.updateBadges({}),

      coursesTenantDenormalizer.onStartUp(),
      eventsTenantDenormalizer.onStartUp(),
      usersTenantsDenormalizer.onStartUp(),

      usersVenuesDenormalizer.onStartUp(),

      // Keep the nextEvent entry updated
      // On startup do a full scan to catch stragglers
      courseNextEventDenormalizer.updateNextEvent({}),
      regionsCountDenormalizer.updateCounters({}),
    ]);
  } catch (error) {
    serverError(error);
  }
  Log.record("DbCacheFields.Update.End", [], {});
}

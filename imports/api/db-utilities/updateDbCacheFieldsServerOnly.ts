import * as groupEditorsDenormalizer from "../courses/editorsDenormalizer";
import * as groupNextEventDenormalizer from "../courses/nextEventDenormalizer";
import * as groupsTenantDenormalizer from "../courses/tenantDenormalizer";
import * as eventsCategoriesDenormalizer from "../events/categoriesDenormalizer";
import * as eventsGroupImageDenormalizer from "../events/courseImageDenormalizer";
import * as eventsTenantDenormalizer from "../events/tenantDenormalizer";
import * as eventsVenueDenormalizer from "../events/venueDenormalizer";
import { Log } from "../log/log";
import { serverError } from "../log/methods";
import * as regionsCountDenormalizer from "../regions/countDenormalizer";
import * as userOrganizationsAndBadgesDenormalizer from "../users/organizationsAndBadgesDenormalizer";
import * as usersTenantsDenormalizer from "../users/tenantsDenormalizer";
import * as usersVenuesDenormalizer from "../users/venuesDenormalizer";

export async function updateDbCacheFieldsServerOnly() {
  Log.record("DbCacheFields.Update.Start", [], {});

  try {
    await Promise.all([
      eventsGroupImageDenormalizer.onStartUp(),
      // Resync location cache in events
      eventsVenueDenormalizer.updateVenue({}),

      // Update list of team (users & organizations) per group, triggers updateOrganizations from events
      groupEditorsDenormalizer.updateEditors({}),

      eventsCategoriesDenormalizer.onStartUp(),

      // Update List of badges per user
      userOrganizationsAndBadgesDenormalizer.updateOrganizationsAndBadges({}),

      groupsTenantDenormalizer.onStartUp(),
      eventsTenantDenormalizer.onStartUp(),
      usersTenantsDenormalizer.onStartUp(),

      usersVenuesDenormalizer.onStartUp(),

      // Keep the nextEvent entry updated
      // On startup do a full scan to catch stragglers
      groupNextEventDenormalizer.updateNextEvent({}),
      regionsCountDenormalizer.updateCounters({}),
    ]);
  } catch (error) {
    serverError(error);
  }
  Log.record("DbCacheFields.Update.End", [], {});
}

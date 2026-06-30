import { EventModel } from "/imports/api/events/events";
import { Zone } from "/imports/utils/local-time";

export function getStartEndDateInTz(event: EventModel, tz: string, locale: string) {
  // Show dates in local time and in users locale
  const regionZone = new Zone(tz);

  const startMoment = regionZone.at(event.start);
  startMoment.locale(locale);

  const endMoment = regionZone.at(event.end);
  endMoment.locale(locale);

  return { startMoment, endMoment };
}

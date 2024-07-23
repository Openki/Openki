import { EventModel } from "../api/events/events";
import { LocalTime } from "../utils/local-time";

export function getStartEndDate(event: EventModel, locale: string) {
  // Show dates in local time and in users locale
  const regionZone = LocalTime.zone(event.region);

  const startMoment = regionZone.at(event.start);
  startMoment.locale(locale);

  const endMoment = regionZone.at(event.end);
  endMoment.locale(locale);

  return { startMoment, endMoment };
}

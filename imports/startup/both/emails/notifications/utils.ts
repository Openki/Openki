import { EventModel } from "../../../../api/events/events";
import { LocalTime, Zone } from "../../../../utils/local-time";

export async function getStartEndDate(event: EventModel, locale: string) {
  // Show dates in local time and in users locale
  const regionZone = await LocalTime.zone(event.region);

  const startMoment = regionZone.at(event.start);
  startMoment.locale(locale);

  const endMoment = regionZone.at(event.end);
  endMoment.locale(locale);

  return { startMoment, endMoment, tz: regionZone.tz };
}

export function getStartEndDateInTz(event: EventModel, tz: string, locale: string) {
  // Show dates in local time and in users locale
  const regionZone = new Zone(tz);

  const startMoment = regionZone.at(event.start);
  startMoment.locale(locale);

  const endMoment = regionZone.at(event.end);
  endMoment.locale(locale);

  return { startMoment, endMoment };
}

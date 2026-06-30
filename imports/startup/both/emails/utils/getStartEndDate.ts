import { EventModel } from "/imports/api/events/events";
import { LocalTime } from "/imports/utils/local-time";

export async function getStartEndDate(event: EventModel, locale: string) {
  // Show dates in local time and in users locale
  const regionZone = await LocalTime.zoneAsync(event.region);

  const startMoment = regionZone.at(event.start);
  startMoment.locale(locale);

  const endMoment = regionZone.at(event.end);
  endMoment.locale(locale);

  return { startMoment, endMoment, tz: regionZone.tz };
}

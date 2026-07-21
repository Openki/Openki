import { useTracker } from "meteor/react-meteor-data";
import moment from "moment-timezone";
import { isObject } from "lodash-es";

import { Regions } from "/imports/api/regions/regions";

/**
 * Serialize local time for mongo
 *
 * References to future local time are stored as ISO 8601 date strings
 * with no seconds and no timezone offset.
 *
 * Example string as stored in the DB:
 *
 * `"2016-06-07T09:30"`
 *
 * This means some points in time (e.g. when DST ends) will be impossible
 * to express unambiguously. This is acceptable as we don't have the UI to
 * handle these either.
 *
 * Rationale for the use of this format:
 * Mongo has no concept of localized dates. All date objects are stored in UTC.
 * This poses a problem when we try to pin an event to a future local time in a
 * timezone.
 *
 * Due to frequent changes in timezones, if we store the date as UTC it might
 * acquire an offset at some point in the future when local time changes
 * relative to UTC. We would have to correct the time in concert with
 * everybody else (our libraries and the timezone info of the browsers of our
 * users). This is infeasible. Thus future dates must be stored as local time.
 */

export function useLocalTimeZone(regionId: string): Zone;
export function useLocalTimeZone(
  condition: { when: boolean },
  regionId: string | undefined,
): Zone | undefined;
export function useLocalTimeZone(
  conditionOrRegionId: { when: boolean } | string,
  regionId?: string | undefined,
) {
  return useTracker(() => {
    const hasCondition = isObject(conditionOrRegionId) && "when" in conditionOrRegionId;
    if (hasCondition) {
      if (!conditionOrRegionId.when) {
        // return undefined when condition is false
        return undefined;
      } else {
        return LocalTime.zone(regionId as string);
      }
    }

    return LocalTime.zone(conditionOrRegionId);
  });
}

export class Zone {
  constructor(public readonly tz: string) {}

  fromString(date: string) {
    return moment.tz(date, this.tz);
  }

  toString(date: Date | moment.Moment) {
    return moment.tz(date, this.tz).format(LocalTime.DateTimeFormat);
  }

  at(date: Date) {
    return moment.tz(date, this.tz);
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace LocalTime {
  export const DateFormat = "YYYY-MM-DD";
  export const TimeFormat = "HH:mm";
  export const DateTimeFormat = DateFormat + "[T]" + TimeFormat;

  /**
   * Turn a moment object into a local date string without time offset in the format "YYYY-MM-DDTHH:mm"
   */
  export function toString(date: Date | moment.Moment) {
    return moment(date).format(DateTimeFormat);
  }

  /**
   * Read local date from string
   *
   * Note that the returned date will be faux UTC.
   *
   * @param dateStr the expected format is "YYYY-MM-DDTHH:mm"
   */
  export function fromString(dateStr: string) {
    return moment.utc(dateStr);
  }

  export function now() {
    return moment.utc().add(moment().utcOffset(), "minutes");
  }

  export function zone(regionId: string) {
    const region = Regions.findOne(regionId);
    if (!region) {
      throw new Error(`Unable to load region ${regionId}`);
    }

    const { tz } = region;

    return new Zone(tz);
  }

  export async function zoneAsync(regionId: string) {
    const region = await Regions.findOneAsync(regionId);
    if (!region) {
      throw new Error(`Unable to load region ${regionId}`);
    }

    const { tz } = region;

    return new Zone(tz);
  }
}

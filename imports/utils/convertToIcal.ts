import { Router } from "meteor/iron:router";
import { EventModel } from "../api/events/events";
import * as HtmlTools from "/imports/utils/html-tools";
import { ICalEventData, ICalEventStatus } from "ical-generator";
import { isEmpty, omitBy } from "lodash-es";
import { isOnCustomMap } from "./isOnCustomMap";

export function convertToIcal(dbevent: EventModel): ICalEventData {
  const end = dbevent.end || dbevent.start;

  const twoLines = /<(p|div|h[0-9])>/g;
  const oneLine = /<(ul|ol|li|br ?\/?)>/g;
  const lineDescription = dbevent.description
    .replace(twoLines, "\n\n")
    .replace(oneLine, "\n")
    .trim();
  const plainDescription = HtmlTools.textPlain(lineDescription);
  return omitBy(
    {
      id: dbevent._id,
      start: dbevent.start,
      end,
      summary: dbevent.title,
      location:
        dbevent.venue && !isEmpty(dbevent.venue)
          ? omitBy(
              {
                title: (dbevent.venue.name || "") + (dbevent.room ? " (" + dbevent.room + ")" : ""),
                address: dbevent.venue.address,
                geo:
                  dbevent.venue.loc && !isOnCustomMap(dbevent.venue)
                    ? {
                        lat: dbevent.venue.loc.coordinates[1],
                        lon: dbevent.venue.loc.coordinates[0],
                      }
                    : undefined,
              },
              (v) => !v,
            )
          : undefined,
      description: plainDescription,
      url: Router.url("showEvent", dbevent),
      status: !dbevent.canceled ? ICalEventStatus.CONFIRMED : ICalEventStatus.CANCELLED,
    },
    (v) => !v,
  ) as unknown as ICalEventData;
}

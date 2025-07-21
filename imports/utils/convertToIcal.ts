import { Router } from "meteor/iron:router";
import { EventModel } from "../api/events/events";
import * as HtmlTools from "/imports/utils/html-tools";

export function convertToIcal(dbevent: EventModel) {
  const end = dbevent.end || dbevent.start;

  const location = [];
  if (dbevent.room) {
    location.push(dbevent.room);
  }
  if (dbevent.venue) {
    const { venue } = dbevent;
    location.push(venue.name);
    if (venue.address) {
      location.push(venue.address);
    }
  }

  const twoLines = /<(p|div|h[0-9])>/g;
  const oneLine = /<(ul|ol|li|br ?\/?)>/g;
  const lineDescription = dbevent.description
    .replace(twoLines, "\n\n")
    .replace(oneLine, "\n")
    .trim();
  const plainDescription = HtmlTools.textPlain(lineDescription);
  const event = {
    uid: dbevent._id,
    start: dbevent.start,
    end,
    summary: dbevent.title,
    location: location.join(", "),
    description: plainDescription,
    url: Router.url("showEvent", dbevent),
  };
  return event;
}

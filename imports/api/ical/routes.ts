import { Router } from "meteor/iron:router";
import moment from "moment";

import { EventEntity, EventModel, Events } from "/imports/api/events/events";

import * as StringTools from "/imports/utils/string-tools";
import * as HtmlTools from "/imports/utils/html-tools";

import ical from "ical-generator";
import { Mongo } from "meteor/mongo";

async function sendIcal(events: Mongo.Cursor<EventEntity, EventModel>, response: any) {
  const calendar = ical({ name: "Openki Calendar" });
  let name = "";

  await events.forEachAsync((dbevent) => {
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
    calendar.addEvent({
      uid: dbevent._id,
      start: dbevent.start,
      end,
      summary: dbevent.title,
      location: location.join(", "),
      description: plainDescription,
      url: Router.url("showEvent", dbevent),
    });

    if (!name) {
      const sName = StringTools.slug(dbevent.title);
      const sDate = moment(dbevent.start).format("YYYY-MM-DD");
      name = `openki-${sName}-${sDate}.ics`;
    } else {
      name = "openki-calendar.ics";
    }
  });

  const calendarstring = calendar.toString();

  response.writeHead(200, {
    "Content-Type": "text/calendar; charset=UTF-8",
    "Content-Disposition": `attachment; filename="${name}"`,
  });

  response.write(calendarstring);
  response.end();
}

Router.route("cal", {
  path: "cal/",
  where: "server",
  action() {
    const filter = Events.Filtering();
    const query = (this.params.query as Record<string, unknown>) || {};

    filter.add("start", moment()).read(query).done();

    sendIcal(Events.findFilter(filter.toQuery()), this.response);
  },
});

Router.route("calEvent", {
  path: "cal/event/:_id.ics",
  where: "server",
  async action() {
    await sendIcal(Events.find({ _id: this.params._id as string }), this.response);
  },
});

Router.route("calCourse", {
  path: "cal/course/:_id.ics",
  where: "server",
  async action() {
    await sendIcal(Events.find({ courseId: this.params._id as string }), this.response);
  },
});

import { Router } from "meteor/iron:router";
import moment from "moment";
import ical from "ical-generator";
import { PublicSettings } from "/imports/utils/PublicSettings";

import { EventModel, Events } from "/imports/api/events/events";

import * as StringTools from "/imports/utils/string-tools";
import { convertToIcal } from "../../utils/convertToIcal";

async function sendIcal(events: EventModel[], response: any) {
  const calendar = ical({ name: `${PublicSettings.siteName} Calendar` });
  let name = "";

  events.forEach((dbevent) => {
    const event = convertToIcal(dbevent);
    calendar.createEvent(event);

    if (!name) {
      const sName = StringTools.slug(dbevent.title);
      const sDate = moment(dbevent.start).format("YYYY-MM-DD");
      name = `${StringTools.slug(PublicSettings.siteName)}-${sName}-${sDate}.ics`;
    } else {
      name = `${StringTools.slug(PublicSettings.siteName)}-calendar.ics`;
    }
  });

  const content = calendar.toString();

  response.writeHead(200, {
    "Content-Type": "text/calendar; charset=UTF-8",
    "Content-Disposition": `attachment; filename="${name}"`,
  });

  response.write(content);
  response.end();
}

Router.route("cal", {
  path: "cal/",
  where: "server",
  async action() {
    const filter = Events.Filtering();
    const query = (this.params.query as Record<string, unknown>) || {};

    filter.set("start", moment().add(-2, "years")).read(query);

    await sendIcal(await Events.findFilter(filter.toQuery()).fetchAsync(), this.response);
  },
});

Router.route("calEvent", {
  path: "cal/event/:_id.ics",
  where: "server",
  async action() {
    await sendIcal(
      await Events.find({ _id: this.params._id as string }).fetchAsync(),
      this.response,
    );
  },
});

Router.route("calGroup", {
  path: "cal/group/:_id.ics",
  where: "server",
  async action() {
    await sendIcal(
      await Events.find({ groupId: this.params._id as string }).fetchAsync(),
      this.response,
    );
  },
});

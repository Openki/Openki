import { Router } from "meteor/iron:router";

import IcalExpander from "ical-expander";
import { Venues } from "/imports/api/venues/venues";

Router.route("venueExternalEvents", {
  path: "api/venue/:_id/external-bookings",
  where: "server",
  async action() {
    const venue = await Venues.findOneAsync({ _id: this.params._id as string });

    if (!venue) {
      throw new Error();
    }

    if (!venue.bookingIcal) {
      const body = {
        status: "success",
        data: [],
      };
      this.response.statusCode = 200;
      this.response.setHeader("Content-Type", "application/json; charset=utf-8");
      this.response.end(JSON.stringify(body, null, "\t"));

      return;
    }

    const ical = await fetch(venue.bookingIcal);
    const icalExpander = new IcalExpander({ ics: await ical.text() });
    const events = icalExpander.between(
      new Date(this.params.query.start),
      new Date(this.params.query.end),
    );
    const body = {
      status: "success",
      data: events.events.map((e) => ({
        id: e.uid,
        summary: e.summary,
        location: e.location,
        start: e.startDate.toJSDate().toISOString(),
        end: e.endDate.toJSDate().toISOString(),
        url: e.component.getFirstPropertyValue("url"),
      })),
    };
    this.response.statusCode = 200;
    this.response.setHeader("Content-Type", "application/json; charset=utf-8");
    this.response.end(JSON.stringify(body, null, "\t"));
  },
});

import React, { useEffect } from "react";
import { Session } from "meteor/session";
import moment from "moment";
import { useTranslation } from "react-i18next";

import { EventModel } from "/imports/api/events/events";

import * as Metatags from "/imports/utils/metatags";
import { appendAsJsonLdToBody } from "/imports/utils/event-to-json-ld";
import { truncate } from "lodash";
import { textPlain } from "/imports/utils/html-tools";

import { Event } from "./event";

export function EventPage(data: { event: EventModel; new: boolean }) {
  const { event } = data;
  const { t } = useTranslation();

  useEffect(() => {
    let title;
    let description = "";
    if (event) {
      title = t("event.windowtitle", "{DATE} – {EVENT}", {
        EVENT: event.title,
        DATE: moment(event.startLocal)
          .locale(Session.get("timeLocale") || "en")
          .format("ddd, MMM D"),
      });
      description = truncate(textPlain(event.description), { length: 160 });
      appendAsJsonLdToBody(event);
    } else {
      title = t("event.windowtitle.create", "Create event");
    }
    Metatags.setCommonTags(title, description, event?.publicUrlForDetailsImage());
  });

  return (
    <div className="container">
      <Event event={event} new={data.new} />
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("EventPage", () => EventPage);

import React, { useEffect } from "react";
import { Session } from "meteor/session";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";
import { useSearchParams } from "/imports/utils/react-meteor-router";

import { EventModel } from "/imports/api/events/events";
import * as EventsMethods from "/imports/api/events/methods";
import * as Alert from "/imports/api/alerts/alert";
import { Regions } from "/imports/api/regions/regions";

import * as Metatags from "/imports/utils/metatags";
import { appendAsJsonLdToBody } from "/imports/utils/event-to-json-ld";
import { truncate } from "lodash";
import { textPlain } from "/imports/utils/html-tools";

import * as Analytics from "/imports/ui/lib/analytics";

import { Event } from "./event";

export function EventPage(data: { event: EventModel; isNew: boolean }) {
  const { event } = data;
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  async function removeParticipant(participantId: string, token: string) {
    try {
      await EventsMethods.removeParticipant(event._id, participantId, token);

      Analytics.trackEvent(
        "Unsubscribes RSVPs",
        "Unsubscribes RSVPs as participant",
        Regions.findOne(event.region)?.nameEn,
      );
    } catch (err) {
      Alert.serverError(err, "could not remove participant");
    }
  }

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

  useEffect(() => {
    (async () => {
      if (searchParams.action === "unregister" && searchParams.participant && searchParams.token) {
        await removeParticipant(searchParams.participant, searchParams.token);
      }
    })();
  }, [searchParams.action, searchParams.participant, searchParams.token]);

  if (searchParams.action === "unregister" && searchParams.participant && searchParams.token) {
    return (
      <div className="container mt-3">
        <div className="alert alert-success display-1" role="alert">
          {t("event.details.unregister", "You have been unsubscribed from {EVENT} successfully.", {
            EVENT: event.title,
          })}
          <hr className="border border-black" />
          <a className="btn btn-lg btn-success" href={Router.path("showEvent", event)}>
            {t("event.details.gotoEvent", "Visit event")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Event event={event} isNew={data.isNew} />
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("EventPage", () => EventPage);

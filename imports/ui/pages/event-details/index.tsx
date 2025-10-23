import React, { useEffect, useState } from "react";
import { Session } from "meteor/session";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";
import { useSearchParams } from "/imports/utils/react-meteor-router";

import { EventModel } from "/imports/api/events/events";
import * as EventsMethods from "/imports/api/events/methods";
import { Regions } from "/imports/api/regions/regions";

import * as Metatags from "/imports/utils/metatags";
import { appendAsJsonLdToBody } from "/imports/utils/event-to-json-ld";
import { truncate } from "lodash";
import { textPlain } from "/imports/utils/html-tools";

import * as Analytics from "/imports/ui/lib/analytics";

import { Event } from "./event";
import { ActionResult } from "../../components/ActionResult";

function Unregister({
  event,
  participant,
  token,
}: {
  event: EventModel;
  participant: string;
  token: string;
}) {
  const { t } = useTranslation();
  const [result, setResult] = useState<undefined | "success" | "failed">(undefined);

  useEffect(() => {
    (async () => {
      try {
        await EventsMethods.removeParticipant(event._id, participant, token);
        setResult("success");

        Analytics.trackEvent(
          "Unsubscribes RSVPs",
          "Unsubscribes RSVPs as participant",
          Regions.findOne(event.region)?.nameEn,
        );
      } catch {
        setResult("failed");
      }
    })();
  }, [participant, token]);

  if (result === "success") {
    return (
      <ActionResult
        type="success"
        title={t(
          "event.details.unregister.success",
          'You have been unsubscribed from "{EVENT}" successfully.',
          { EVENT: event.title },
        )}
        actions={[
          {
            href: Router.path("showEvent", event),
            text: t("event.details.gotoEvent", "Visit event"),
          },
        ]}
      />
    );
  }

  if (result === "failed") {
    return (
      <ActionResult
        type="failed"
        title={t("event.details.unregister.failed.title", "Something went wrong")}
        actions={[
          {
            description: t(
              "event.details.unregister.failed.action.description",
              "You might also want to check if you were already unsubscribed:",
            ),
            href: Router.path("showEvent", event),
            text: t("event.details.gotoEvent", "Visit event"),
          },
        ]}
      >
        {t(
          "event.details.unregister.failed.description",
          'Unsubscribing from "{EVENT}" did not work. The link might be broken.',
          {
            EVENT: event.title,
          },
        )}
      </ActionResult>
    );
  }

  return null;
}

export function EventPage({ event, isNew }: { event: EventModel; isNew: boolean }) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  useEffect(() => {
    let title;
    let description = "";
    if (!isNew && event) {
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

  if (searchParams.action === "unregister" && searchParams.participant && searchParams.token) {
    return (
      <Unregister event={event} participant={searchParams.participant} token={searchParams.token} />
    );
  }

  return (
    <div className="container">
      <Event event={event} isNew={isNew} />
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("EventPage", () => EventPage);

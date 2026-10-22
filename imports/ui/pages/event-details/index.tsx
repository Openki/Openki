import { Router } from "meteor/iron:router";
import { Session } from "meteor/session";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "/imports/ui/hooks/react-meteor-router";

import { EventModel } from "/imports/api/events/events";
import * as EventsMethods from "/imports/api/events/methods";
import { Regions } from "/imports/api/regions/regions";

import * as Analytics from "/imports/ui/lib/analytics";

import { EventAsJsonLd } from "../../components/EventAsJsonLd";
import { MetaTags } from "/imports/ui/components/MetaTags";
import { ActionResult } from "../../components/ActionResult";
import { Event } from "./event";

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

  if (searchParams.action === "unregister" && searchParams.participant && searchParams.token) {
    return (
      <Unregister event={event} participant={searchParams.participant} token={searchParams.token} />
    );
  }

  let title;
  if (!isNew && event) {
    title = t("event.windowtitle", "{DATE} – {EVENT}", {
      EVENT: event.title,
      DATE: moment(event.startLocal)
        .locale(Session.get("timeLocale") || "en")
        .format("ddd, MMM D"),
    });
  } else {
    title = t("event.windowtitle.create", "Create event");
  }
  return (
    <>
      <MetaTags
        title={title}
        description={event.description}
        image={event?.publicUrlForDetailsImage()}
      />
      <EventAsJsonLd event={event} />

      {searchParams.nextActions === "1" && (
        <ActionResult
          type="success"
          dismissible
          title={t(
            "event.details.registration.alertNextActions.title",
            "You registered successfully.",
          )}
          actions={[
            !event.isFullyBooked()
              ? {
                  text: t(
                    "event.details.registration.alertNextActions.share",
                    "Invite your friends",
                  ),
                  href: "#share",
                }
              : undefined,
            {
              text: t(
                "event.details.registration.alertNextActions.calendar",
                "Add events to my calendar",
              ),
              href: Router.path("profile", undefined, { hash: "#my-events" }),
            },
          ]}
        >
          {t("event.details.registration.alertNextActions.message", "What do you want to do next?")}
        </ActionResult>
      )}
      <div className="container">
        <Event event={event} isNew={isNew} />
      </div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("EventPage", () => EventPage);

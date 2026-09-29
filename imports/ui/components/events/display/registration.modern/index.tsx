import React from "react";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";

import { useUser } from "/imports/utils/react-meteor-data";
import * as Alert from "/imports/api/alerts/alert";
import { EventModel } from "/imports/api/events/events";
import * as EventsMethods from "/imports/api/events/methods";
import { Regions } from "/imports/api/regions/regions";
import { useFindFilter as useOrganizationsFindFilter } from "/imports/api/organizations/publications";

import { EventParticipants } from "/imports/ui/components/events/participants.modern";
import { RegisterPanel } from "./register-panel";
import { UnregisterPanel } from "./unregister-panel";
import { Sharing } from "../../../sharing";

import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import * as Analytics from "/imports/ui/lib/analytics";

import "./styles.scss";

function ButtonRegistrationClosed() {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      id="event-details-isFullyBooked"
      className="btn btn-warning btn-lg fw-bold"
    >
      {t("event.details.isFullyBooked", "The event is fully booked")}
    </button>
  );
}

export interface Props {
  event: EventModel;
}

function Registration({ event }: { event: EventModel }) {
  const user = useUser();
  const { t } = useTranslation();
  const { dateFormat } = useDateTimeFormat();

  function howManyFreePlaces() {
    const occupied = event.numberOfParticipants();
    return event.maxParticipants - occupied;
  }

  // eslint-disable-next-line react-hooks/purity
  const isFuture = Date.now() < event.end.getTime();

  async function addParticipant(companions = 0) {
    try {
      await EventsMethods.addParticipant(event._id, companions);

      Analytics.trackEvent(
        "RSVPs",
        "RSVPs as participant from program view",
        Regions.findOne(event.region)?.nameEn,
      );
    } catch (err) {
      Alert.serverError(err);
    }
  }

  async function removeParticipant() {
    try {
      await EventsMethods.removeParticipant(event._id);

      Analytics.trackEvent(
        "Unsubscribes RSVPs",
        "Unsubscribes RSVPs as participant",
        Regions.findOne(event.region)?.nameEn,
      );
    } catch (err) {
      Alert.serverError(err, "could not remove participant");
    }
  }

  return (
    <>
      <p className="card-text">
        {!event.attendedBy(user?._id) ? (
          !event.maxParticipants ||
          (howManyFreePlaces() > 0 && (
            <>
              {!!event.maxParticipants && (
                <>
                  {t(
                    "event.details.participants.free.places",
                    "{NUM, plural, =0{No free seats} one{one free seat} other{# free seats} }",
                    { NUM: howManyFreePlaces() },
                  )}
                  <br />
                </>
              )}
              <span className="fw-bold">
                {t(
                  "event.details.i-participate-no",
                  "Let it be known you are participating in this event. Your registration is binding.",
                )}
              </span>
            </>
          ))
        ) : (
          <>
            <i className="fa-solid fa-check fa-fw text-success" />{" "}
            <span className="fw-bold">
              {t("event.details.youAreRegistered", "You are now registered.")}
            </span>
          </>
        )}
      </p>

      {isFuture && !event.isPrivate() && event.attendedBy(user?._id) && (
        <p className="card-text">
          {t("sharing.title", "Invite your friends")}
          <Sharing
            title={t("event.details.sharing.title", "Invitation to {EVENTTITLE} on the {DATE}", {
              EVENTTITLE: event.title,
              DATE: dateFormat(event.startLocal),
            })}
            text={t(
              "event.details.sharing.text",
              "Hi!\nI wanted to let you know that I participate on {EVENTTITLE} on the {DATE}.\nDo you want to join me?",
              { EVENTTITLE: event.title, DATE: dateFormat(event.startLocal) },
            )}
            url={Router.url("showEvent", event)}
          />
        </p>
      )}

      {!event.attendedBy(user?._id) ? (
        <p className="card-text">
          {!event.canceled &&
            (!event.isFullyBooked() ? (
              <RegisterPanel
                event={event}
                onRegister={async (companions) => {
                  await addParticipant(companions);
                }}
              />
            ) : (
              <ButtonRegistrationClosed />
            ))}
        </p>
      ) : (
        <p className="card-text mt-5">
          <UnregisterPanel
            event={event}
            onUnregister={async () => {
              await removeParticipant();
            }}
          />
        </p>
      )}
    </>
  );
}

export function RegistrationParticipants({ event }: Props) {
  const { t } = useTranslation();
  const user = useUser();

  const [organizationsIsLoading, organizations] = useOrganizationsFindFilter({
    ids: event.allTeamOrganizations(),
  });

  // eslint-disable-next-line react-hooks/purity
  const isFuture = Date.now() < event.end.getTime();

  if (organizationsIsLoading()) {
    return null;
  }

  const registrationClosed = organizations.some((o) => o.registrationClosed);

  return (
    <>
      {isFuture && !event.canceled && (
        <>
          <h4 className="card-title">{t("event.details.registration", "Registration")}</h4>
          {event.noRsvp ? (
            <p className="card-text fw-bold">
              {t("event.details.noRsvp", "Registration not required.")}
            </p>
          ) : !registrationClosed ? (
            <Registration event={event} />
          ) : (
            <p className="card-text fw-bold">
              {t("event.details.registrationClosed", "The registration for this event is closed.")}
            </p>
          )}
        </>
      )}
      {!event.noRsvp && event.attendedBy(user?._id) && <EventParticipants event={event} />}
    </>
  );
}

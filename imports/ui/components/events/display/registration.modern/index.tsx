import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { useUser } from "/imports/utils/react-meteor-data";
import moment from "moment";

import * as Alert from "/imports/api/alerts/alert";
import { EventModel } from "/imports/api/events/events";
import * as EventsMethods from "/imports/api/events/methods";
import { Regions } from "/imports/api/regions/regions";
import { useFindFilter as useGroupsFindFilter } from "/imports/api/groups/publications";

import { EventParticipants } from "/imports/ui/components/events/participants.modern";
import { RegisterPanel } from "./register-panel";
import { UnregisterPanel } from "./unregister-panel";
import { Sharing } from "../../../sharing";

import * as Analytics from "/imports/ui/lib/analytics";

import "./styles.scss";

function ButtonRegistrationClosed(props: {
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  busy?: boolean | undefined;
}) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className="btn btn-warning btn-event text-center"
      onClick={props.onClick}
      disabled={props.busy}
    >
      {props.busy ? (
        <>
          <span className="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></span>{" "}
          {t("_button.addingYouToWaitingQueue", "Adding you to waiting queue…")}
        </>
      ) : (
        t("event.details.isFullyBooked", "The event is fully booked")
      )}
    </button>
  );
}

export interface Props {
  event: EventModel;
}

function Registration({ event }: { event: EventModel }) {
  const user = useUser();
  const { t } = useTranslation();
  const [isBusy, setIsBusy] = useState("");

  function howManyFreePlaces() {
    const occupied = event.numberOfParticipants();
    return event.maxParticipants - occupied;
  }

  function isFuture() {
    return moment().isBefore(event.end);
  }

  async function addParticipant(companions = 0) {
    setIsBusy("registering");
    try {
      await EventsMethods.addParticipant(event._id, companions);

      // Todo: show feedback
      Alert.success(t("event.details.registration.alert.title", "Your seat is reserved."));
      Analytics.trackEvent(
        "RSVPs",
        "RSVPs as participant from program view",
        Regions.findOne(event.region)?.nameEn,
      );
    } catch (err) {
      Alert.serverError(err);
    } finally {
      setIsBusy("");
    }
  }

  async function removeParticipant() {
    setIsBusy("unregistering");

    try {
      await EventsMethods.removeParticipant(event._id);

      Analytics.trackEvent(
        "Unsubscribes RSVPs",
        "Unsubscribes RSVPs as participant",
        Regions.findOne(event.region)?.nameEn,
      );
    } catch (err) {
      Alert.serverError(err, "could not remove participant");
    } finally {
      setIsBusy("");
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
              <strong>
                {t(
                  "event.details.i-participate-no",
                  "Let it be known you are participating in this event. Your registration is binding.",
                )}
              </strong>
            </>
          ))
        ) : (
          <>
            <i className="fa-solid fa-check fa-fw text-success" aria-hidden="true"></i>{" "}
            <strong className="pre-line">
              {t(
                "event.details.i-participate-yes",
                "You are now registered.\nYour registration is binding.",
              )}
            </strong>
          </>
        )}
      </p>

      {isFuture() && !event.isPrivate() && event.attendedBy(user?._id) && (
        <p className="card-text">
          <Sharing />
        </p>
      )}

      <p className="card-text">
        {!event.attendedBy(user?._id) ? (
          !event.canceled &&
          (!event.isFullyBooked() ? (
            <RegisterPanel
              event={event}
              busy={isBusy === "registering"}
              onRegister={async (companions) => {
                await addParticipant(companions);
              }}
            />
          ) : (
            <ButtonRegistrationClosed busy={isBusy === "registering"} />
          ))
        ) : (
          <UnregisterPanel
            busy={isBusy === "unregistering"}
            event={event}
            onUnregister={async () => {
              await removeParticipant();
            }}
          />
        )}
      </p>
    </>
  );
}

export function RegistrationParticipants({ event }: Props) {
  const { t } = useTranslation();
  const user = useUser();

  const [groupsIsLoading, groups] = useGroupsFindFilter({
    ids: event.allGroupOrganizers(),
  });

  function isFuture() {
    return moment().isBefore(event.end);
  }

  if (groupsIsLoading()) {
    return null;
  }

  const registrationClosed = groups.some((g) => g.registrationClosed);

  return (
    <>
      {isFuture() && (
        <>
          <h4 className="card-title">{t("event.details.registration", "Registration")}</h4>
          {event.noRsvp ? (
            <p className="card-text">
              <strong>{t("event.details.noRsvp", "Registration not required.")}</strong>
            </p>
          ) : !registrationClosed ? (
            <Registration event={event} />
          ) : (
            <p className="card-text">
              <strong>
                {t(
                  "event.details.registrationClosed",
                  "The registration for this event is closed.",
                )}
              </strong>
            </p>
          )}
        </>
      )}
      {!event.noRsvp && event.attendedBy(user?._id) &&
        // when registration closed, only show participant list when more than 0 participants
        (!registrationClosed || !!event.participants?.length) && (
          <EventParticipants event={event} />
        )}
    </>
  );
}

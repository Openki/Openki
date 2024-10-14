/* eslint-disable no-nested-ternary */
import { useSearchParams } from "/imports/utils/react-meteor-router";
import { useTranslation } from "react-i18next";
import { Template } from "meteor/templating";
import React, { useState } from "react";
import { useUser } from "/imports/utils/react-meteor-data";
import moment from "moment";

import * as Alert from "/imports/api/alerts/alert";
import { EventModel } from "/imports/api/events/events";
import * as EventsMethods from "/imports/api/events/methods";
import { Regions } from "/imports/api/regions/regions";

import { PleaseLogin } from "/imports/ui/components/please-login";
import { EventParticipants } from "/imports/ui/components/events/participants";
import { RegisterPanel } from "./register-panel";
import { UnregisterPanel } from "./unregister-panel";

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

export type Props = {
  event: EventModel;
};

export function EventRegistration({ event }: Props) {
  const user = useUser();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [isBusy, setIsBusy] = useState("");

  async function addParticipant(companions = 0) {
    setIsBusy("registering");
    try {
      await EventsMethods.addParticipant(event._id, companions);

      Alert.success(t("event.details.registration.alert.title", "Your seat is reserved."));
      Analytics.trackEvent("RSVPs", "RSVPs as participant", Regions.findOne(event.region)?.nameEn);
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

  function isFuture() {
    return moment().isBefore(event.end);
  }

  return (
    <>
      {searchParams.action === "register" ? (
        <PleaseLogin
          type="auto"
          onRender={() => {
            // register from email
            addParticipant();
          }}
        />
      ) : null}
      {searchParams.action === "unregister" ? (
        <PleaseLogin
          type="auto"
          onRender={() => {
            // unregister from email
            removeParticipant();
          }}
        />
      ) : null}
      {isFuture() ? (
        <>
          <div className="page-component">
            <div className="page-component-header">
              <h4>{t("event.details.registration", "Registration")}</h4>
            </div>
          </div>
          {event.noRsvp ? (
            <div className="page-component">
              <b>{t("event.details.noRsvp", "Registration not required.")}</b>
            </div>
          ) : (
            <>
              <div className="page-component">
                <b>
                  {!event.attendedBy(user?._id)
                    ? t(
                        "event.details.i-participate-no",
                        "Let it be known you are participating in this event. Your registration is binding.",
                      )
                    : t(
                        "event.details.i-participate-yes",
                        "You are now registered. Your registration is binding.",
                      )}
                </b>
              </div>
              <div className="page-component">
                {!event.attendedBy(user?._id) ? (
                  !event.canceled ? (
                    !event.isFullyBooked() ? (
                      <RegisterPanel
                        event={event}
                        busy={isBusy === "registering"}
                        onRegister={async (companions) => {
                          await addParticipant(companions);
                        }}
                      />
                    ) : (
                      <ButtonRegistrationClosed busy={isBusy === "registering"} />
                    )
                  ) : null
                ) : (
                  <UnregisterPanel
                    busy={isBusy === "unregistering"}
                    event={event}
                    onUnregister={async () => {
                      await removeParticipant();
                    }}
                  />
                )}
              </div>
            </>
          )}
        </>
      ) : null}
      {!event.noRsvp ? (
        <div className="page-component">
          <EventParticipants event={event} />
        </div>
      ) : null}
    </>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("EventRegistration", () => EventRegistration);

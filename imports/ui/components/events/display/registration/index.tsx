import { Router } from "meteor/iron:router";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/ui/hooks/react-meteor-data";
import { useSearchParams } from "/imports/ui/hooks/react-meteor-router";
import * as Analytics from "/imports/ui/lib/analytics";

import * as Alert from "/imports/api/alerts/alert";
import { EventModel } from "/imports/api/events/events";
import * as EventsMethods from "/imports/api/events/methods";
import { useFindFilter as useOrganizationsFindFilter } from "/imports/api/organizations/publications";
import { Regions } from "/imports/api/regions/regions";

import { RegisterPanel } from "./register-panel";
import { UnregisterPanel } from "./unregister-panel";
import { EventParticipants } from "/imports/ui/components/events/participants";
import { useAccountTasks } from "/imports/ui/hooks/useAccountTasks";

import "./styles.scss";

function ButtonRegistrationClosed() {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      id="event-details-isfullyBooked"
      className="btn btn-warning btn-lg fw-bold"
    >
      {t("event.details.isFullyBooked", "The event is fully booked")}
    </button>
  );
}

export interface Props {
  event: EventModel;
}

export function EventRegistration({ event }: Props) {
  const user = useUser();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { promptToLogin } = useAccountTasks();

  const [organizationsIsLoading, organizations] = useOrganizationsFindFilter({
    ids: event.allTeamOrganizations(),
  });

  async function addParticipant(companions = 0) {
    try {
      await EventsMethods.addParticipant(event._id, companions);

      Router.go("showEvent", event, { query: { nextActions: "1" } });

      Analytics.trackEvent("RSVPs", "RSVPs as participant", Regions.findOne(event.region)?.nameEn);
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

  // eslint-disable-next-line react-hooks/purity
  const isFuture = Date.now() < event.end.getTime();

  useEffect(() => {
    (async () => {
      if (searchParams.action === "register") {
        if (!(await promptToLogin())) {
          return;
        }
        // register from email
        await addParticipant();
      }
    })();
  }, []);

  if (organizationsIsLoading()) {
    return null;
  }

  const registrationClosed = organizations.some((o) => o.registrationClosed);

  return (
    <>
      {isFuture && (
        <>
          <div className="page-component">
            <div className="page-component-header">
              <h4>{t("event.details.registration", "Registration")}</h4>
            </div>
          </div>
          {event.canceled ? (
            <div className="page-component fw-bold">
              {t(
                "event.details.canceled",
                "The event has been canceled. Registration is therefore closed.",
              )}
            </div>
          ) : event.noRsvp ? (
            <div className="page-component fw-bold">
              {t("event.details.noRsvp", "Registration not required.")}
            </div>
          ) : registrationClosed ? (
            <div className="page-component whitespace-pre-line fw-bold">
              {t("event.details.registrationClosed", "The registration for this event is closed.")}
            </div>
          ) : (
            <>
              <div className="page-component fw-bold">
                {!event.attendedBy(user?._id)
                  ? t(
                      "event.details.i-participate-no",
                      "Let it be known you are participating in this event. Your registration is binding.",
                    )
                  : t(
                      "event.details.i-participate-yes",
                      "You are now registered.\nYour registration is binding.",
                    )}
              </div>
              <div className="page-component">
                {!event.attendedBy(user?._id) ? (
                  !event.isFullyBooked() ? (
                    <RegisterPanel
                      event={event}
                      onRegister={async (companions) => {
                        await addParticipant(companions);
                      }}
                    />
                  ) : (
                    <ButtonRegistrationClosed />
                  )
                ) : (
                  <UnregisterPanel
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
      )}
      {!event.noRsvp &&
        // when registration closed, only show participant list when more than 0 participants
        (!registrationClosed || !!event.participants?.length) && (
          <div className="page-component mt-4">
            <EventParticipants event={event} />
          </div>
        )}
    </>
  );
}

import React, { JSX } from "react";
import { useTranslation } from "react-i18next";
import { EventModel } from "/imports/api/events/events";
import { EventBox } from "./components/EventBox";
import { Footer } from "./components/Footer";
import { Props as UnsubscribeLinkProps } from "./components/UnsubscribeLink";
import { getFragmentsWithKeys } from "/imports/ui/lib/getFragmentsWithKeys";

export interface Props {
  event: EventModel;
  tz: string;
  recipientTakePart: boolean | undefined;
  registrationClosed: boolean;
  registerToEventLink: string;
  group: JSX.Element;
  groupName: string;
  unsubscribeFromGroupLink: string;
  isNew: boolean;
  replicas: EventModel[];
  subject: string;
  additionalMessage: string | undefined;
  username: string;
  unsubscribe: Omit<UnsubscribeLinkProps, "lng">;
  campaign: string;
  lng: string;
}

export function Event({
  event,
  tz,
  recipientTakePart,
  registrationClosed,
  registerToEventLink,
  group,
  groupName,
  unsubscribeFromGroupLink,
  isNew,
  replicas,
  additionalMessage,
  username,
  unsubscribe,
  campaign,
  lng,
}: Props) {
  const { t } = useTranslation(undefined, { lng });

  function intro() {
    if (isNew) {
      if (!event.replicaOf) {
        return t("notification.event.mail.new", "A new event was just published for {GROUP}:", {
          GROUP: group,
        });
      }

      return t(
        "notification.event.mail.new.withReplicats",
        "New event(s) where just published for {GROUP}. You can see the next one below.",
        {
          GROUP: group,
        },
      );
    }
    if (replicas.length === 0) {
      return t("notification.event.mail.changed", "The following event for {GROUP} changed.", {
        GROUP: group,
      });
    }

    return t(
      "notification.event.mail.changed.withReplicats",
      "The following event for {GROUP} changed, these changes have also been applied to {NUM, plural, one{the later event} other{# later events} }.",
      { GROUP: group, NUM: replicas.length },
    );
  }

  return (
    <>
      <tr>
        <td>
          <h5 className="title">{t("email.base.greeting", { USER: username })}</h5>
          <p>{intro()}</p>
          {!!additionalMessage && (
            <>
              <p>
                {t(
                  "notification.event.mail.personalMessage",
                  "A coordinator left a message for you:",
                )}
              </p>
              <table className="comment-box">
                <tr>
                  <td>
                    <span className="pre">{additionalMessage}</span>
                  </td>
                </tr>
              </table>
            </>
          )}

          <EventBox event={event} tz={tz} campaign={campaign} lng={lng} />

          {!recipientTakePart && !registrationClosed && (
            <>
              {!event.noRsvp && (
                <>
                  <p className="gap-md text-center">
                    {t(
                      "notification.event.mail.informRegisterEvent",
                      "Let us know if you participate in this event:",
                    )}
                  </p>
                  <p className="text-center">
                    <a className="button" href={registerToEventLink}>
                      {t("notification.event.mail.registerEvent", "Yes, I take part.")}
                    </a>
                  </p>
                </>
              )}
              <p className="gap-md text-center">
                {t("notification.event.mail.notinterested", "Not interested anymore?")}
              </p>
              <p className="text-center">
                <a href={unsubscribeFromGroupLink}>
                  {t("notification.event.mail.unsubscribe", "Unsubscribe from {GROUP}", {
                    GROUP: groupName,
                  })}
                </a>
              </p>
            </>
          )}
        </td>
      </tr>
      <Footer
        receiveNote={getFragmentsWithKeys(
          t(
            "notification.event.mail.notice",
            "You receive this e-mail because you are involved in {GROUP}.",
            { GROUP: group },
          ),
        )}
        unsubscribe={unsubscribe}
        campaign={campaign}
        lng={lng}
      />
    </>
  );
}

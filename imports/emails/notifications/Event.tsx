/* eslint-disable no-nested-ternary */
import React from "react";
import { useTranslation } from "react-i18next";
import { EventModel } from "/imports/api/events/events";
import { EventBox } from "./components/EventBox";
import { Footer } from "./components/Footer";
import { Props as UnsubscribeLinkProps } from "./components/UnsubscribeLink";

export type Props = {
  event: EventModel;
  tz: string;
  recipientTakePart: boolean | undefined;
  registerToEventLink: string;
  course: React.JSX.Element;
  courseName: string;
  unsubscribeFromCourseLink: string;
  isNew: boolean;
  replicats: EventModel[];
  subject: string;
  additionalMessage: string | undefined;
  username: string;
  unsubscribe: Omit<UnsubscribeLinkProps, "lng">;
  campaign: string;
  lng: string;
};

export function Event({
  event,
  tz,
  recipientTakePart,
  registerToEventLink,
  course,
  courseName,
  unsubscribeFromCourseLink,
  isNew,
  replicats,
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
        return t("notification.event.mail.new", "A new event was just published for {COURSE}:", {
          COURSE: course,
        });
      }

      return t(
        "notification.event.mail.new.withReplicats",
        "New event(s) where just published for {COURSE}. You can see the next one below.",
        {
          COURSE: course,
        },
      );
    }
    if (replicats.length === 0) {
      return t("notification.event.mail.changed", "The following event for {COURSE} changed.", {
        COURSE: course,
      });
    }

    return t(
      "notification.event.mail.changed.withReplicats",
      "The following event for {COURSE} changed, these changes have also been applied to {NUM, plural, one{the later event} other{# later events} }.",
      { COURSE: course, NUM: replicats.length },
    );
  }

  return (
    <>
      <tr>
        <td>
          <h5 className="title">{t("email.base.greeting", { USERNAME: username })}</h5>
          <p>{intro()}</p>
          {!!additionalMessage && (
            <>
              <p>
                {t(
                  "notification.event.mail.personalMessage",
                  "The organizer left a message for you:",
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

          {!event.noRsvp && !recipientTakePart && (
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
              <p className="gap-md text-center">
                {t("notification.event.mail.notinterested", "Not interested anymore?")}
              </p>
              <p className="text-center">
                <a href={unsubscribeFromCourseLink}>
                  {t("notification.event.mail.unsubscribe", "Unsubscribe from {COURSE}", {
                    COURSE: courseName,
                  })}
                </a>
              </p>
            </>
          )}
        </td>
      </tr>
      <Footer
        receiveNote={t(
          "notification.event.mail.notice",
          "You receive this e-mail because you are involved in {COURSE}.",
          { COURSE: course },
        )}
        unsubscribe={unsubscribe}
        campaign={campaign}
        lng={lng}
      />
    </>
  );
}

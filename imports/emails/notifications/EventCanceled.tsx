import React, { JSX } from "react";
import { useTranslation } from "react-i18next";
import { EventModel } from "/imports/api/events/events";
import { EventBox } from "./components/EventBox";
import { Footer } from "./components/Footer";
import { Props as UnsubscribeLinkProps } from "./components/UnsubscribeLink";

export interface Props {
  username: string;
  event: EventModel;
  tz: string;
  eventTitle: JSX.Element | undefined;
  message: string;
  unsubscribe: Omit<UnsubscribeLinkProps, "lng">;
  campaign: string;
  lng: string;
}

export function EventCanceled({
  username,
  event,
  tz,
  eventTitle,
  message,
  unsubscribe,
  campaign,
  lng,
}: Props) {
  const { t } = useTranslation(undefined, { lng });
  return (
    <>
      <tr>
        <td>
          <h5 className="title">{t("email.base.greeting", { USER: username })}</h5>
          <p>
            {t(
              "notification.event.canceled.mail.intro",
              "You have been registered for {EVENT}. Unfortunately the event just got cancelled.",
              { EVENT: eventTitle },
            )}
          </p>
          <p>
            {t(
              "notification.event.canceled.mail.personalMessage",
              "A coordinator has left the following message for you:",
            )}
          </p>
          <table className="comment-box">
            <tr>
              <td dangerouslySetInnerHTML={{ __html: message }}></td>
            </tr>
          </table>
          <EventBox event={event} tz={tz} campaign={campaign} lng={lng} />
        </td>
      </tr>
      <Footer
        receiveNote={t(
          "notification.event.canceled.mail.notice",
          "You receive this e-mail because you are involved in {EVENT}.",
          { EVENT: eventTitle },
        )}
        unsubscribe={unsubscribe}
        campaign={campaign}
        lng={lng}
      />
    </>
  );
}

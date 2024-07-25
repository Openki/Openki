import React from "react";
import { useTranslation } from "react-i18next";
import { EventModel } from "/imports/api/events/events";
import { EventBox } from "./components/EventBox";
import { Footer } from "./components/Footer";
import { Props as UnsubscribeLinkProps } from "./components/UnsubscribeLink";

export type Props = {
  companions: number;
  event: EventModel;
  eventDate: string;
  username: string;
  unsubscribe: Omit<UnsubscribeLinkProps, "lng">;
  campaign: string;
  lng: string;
};
export function Rsvp({
  companions,
  event,
  eventDate,
  username,
  unsubscribe,
  campaign,
  lng,
}: Props) {
  const { t } = useTranslation(undefined, { lng });
  return (
    <>
      <tr>
        <td>
          <h5 className="title">{t("email.base.greeting", { USERNAME: username })}</h5>
          <p>
            {t(
              "notification.rsvp.mail.intro",
              "We are looking forward to see {COMPANIONS, plural, =0{you} other{you and your companion} } on {DATE}. Your {COMPANIONS, plural, =0{seat is} other{seats are} } reserved. If you can not join the event, please let the organizers know by withdrawing your registration.",
              { DATE: eventDate, COMPANIONS: companions },
            )}
          </p>
          <p>{t("notification.rsvp.mail.attending", "You are attending the following event:")}</p>
          <EventBox event={event} campaign={campaign} lng={lng} />
        </td>
      </tr>
      <Footer unsubscribe={unsubscribe} campaign={campaign} lng={lng} />
    </>
  );
}

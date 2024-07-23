import React from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";
import { EventModel } from "/imports/api/events/events";
import { EventBox } from "./EventBox";

export type Props = {
  companions: number;
  unsubLink: string;
  event: EventModel;
  eventDate: string;
  siteName: string;
  username: string;
  campaign: string;
  lng: string;
};
export function Rsvp({
  companions,
  unsubLink,
  event,
  eventDate,
  siteName,
  username,
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
      <tr>
        <td>
          <table className="footer">
            <tr>
              <td>
                <a href={unsubLink}>
                  {t("email.base.unsubscribeLink.automatedNotifications", { SITENAME: siteName })}
                </a>
                &nbsp;
                <a href={Router.url("profile", { query: `campaign=${campaign}` })}>
                  {t("email.base.profileLink")}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </>
  );
}

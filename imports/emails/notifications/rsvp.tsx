import React from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";
import { EventModel } from "/imports/api/events/events";

export type Props = {
  companions: number;
  unsubLink: string;
  event: EventModel;
  eventDate: string;
  eventStart: string;
  eventEnd: string;
  venueLine: string | undefined;
  eventLink: string;
  calLink: string;
  siteName: string;
  username: string;
  lng: string;
};

export function Rsvp({
  companions,
  unsubLink,
  event,
  eventDate,
  eventStart,
  eventEnd,
  venueLine,
  eventLink,
  calLink,
  siteName,
  username,
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
          <table className="event">
            <tr>
              <td className="event-header">
                <a href={eventLink}>
                  <strong>
                    {eventDate}
                    <br />
                    {eventStart}
                    {eventEnd ? ` - ${eventEnd}` : null}
                  </strong>
                  {venueLine ? (
                    <>
                      <br />
                      {venueLine}
                    </>
                  ) : null}
                </a>
              </td>
            </tr>
            <tr>
              <td className="event-gap"></td>
            </tr>
            <tr>
              <td className="event-body">
                <h5 className="title">{event.title}</h5>
                <p dangerouslySetInnerHTML={{ __html: event.description }}></p>
                <a className="button event-confirmation-email-button" href={eventLink}>
                  {t("notification.rsvp.mail.linkEvent", "Visit Event")}
                </a>
              </td>
            </tr>
            <tr>
              <td className="event-link">
                <a href={calLink}>
                  {t("notification.rsvp.mail.linkCalendar", "Add this event to my calendar")}
                </a>
                <br />
              </td>
            </tr>
          </table>
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
                <a href={Router.url("profile", { query: "campaign=rsvpNotify" })}>
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

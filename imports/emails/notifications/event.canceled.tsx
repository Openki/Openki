import React from "react";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { EventModel } from "/imports/api/events/events";

export type Props = {
  username: string;
  unsubLink: string;
  event: EventModel;
  eventDate: string;
  eventStart: string;
  eventEnd: string;
  venueLine: string | undefined;
  eventLink: string;
  siteName: string;
  eventTitle: React.JSX.Element | undefined;
  message: string;
  lng: string;
};

export function EventCanceled({
  username,
  unsubLink,
  event,
  eventDate,
  eventStart,
  eventEnd,
  venueLine,
  eventLink,
  siteName,
  eventTitle,
  message,
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
              "notification.event.canceled.mail.intro",
              "You have been registered for {EVENT}. Unfortunately the event just got cancelled.",
              { EVENT: eventTitle },
            )}
          </p>
          <p>
            {t(
              "notification.event.canceled.mail.personalMessage",
              "The Organizer has left the following message for you:",
            )}
          </p>
          <table className="comment-box">
            <tr>
              <td dangerouslySetInnerHTML={{ __html: message }}></td>
            </tr>
          </table>
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
              <td className="event-canceled text-center">
                <strong>
                  {t("notification.event.canceled.mail.canceled", "This event got canceled")}
                </strong>
              </td>
            </tr>
            <tr>
              <td className="event-gap"></td>
            </tr>
            <tr>
              <td className="event-body">
                <h5 className="title">{event.title}</h5>
                <p dangerouslySetInnerHTML={{ __html: event.description }}></p>
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
                {t(
                  "notification.event.canceled.mail.notice",
                  "You receive this e-mail because you are involved in {EVENT}.",
                  { EVENT: eventTitle },
                )}
              </td>
            </tr>
            <tr>
              <td>
                <a href={unsubLink}>
                  {t("email.base.unsubscribeLink.automatedNotifications", { SITENAME: siteName })}
                </a>
                &nbsp;
                <a href={Router.url("profile", { query: "campaign=eventCanceled" })}>
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

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
  unregisterToEventLink: string;
  calLink: string;
  eventTitle: React.JSX.Element | undefined;
  eventCalendar: string;
  siteName: string;
  username: string;
  lng: string;
};

export function EventReminder({
  companions,
  unsubLink,
  event,
  eventDate,
  eventStart,
  eventEnd,
  venueLine,
  eventLink,
  unregisterToEventLink,
  calLink,
  eventTitle,
  eventCalendar,
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
              "notification.event.reminder.mail.intro",
              'We like to remind you that you are registered for "{EVENTTITLE}". We are looking forward to see {COMPANIONS, plural, =0{you} other{you and your companion} } {EVENTDATE}.',
              { EVENTTITLE: eventTitle, EVENTDATE: eventCalendar, COMPANIONS: companions },
            )}
          </p>
          <p className="gap-md text-center">
            {t(
              "notification.event.reminder.informUnregisterEvent",
              "In case you can not make it, it's important to let the organizers know now:",
            )}
          </p>
          <p className="text-center">
            <a className="button" href={unregisterToEventLink}>
              {t("notification.event.reminder.unregisterEvent", "Un-enroll")}
            </a>
          </p>
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
              </td>
            </tr>
            <tr>
              <td className="event-link">
                <a href={calLink}>
                  {t("notification.event.mail.linkCalendar", "Add this event to my calendar")}
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
                {t(
                  "notification.event.reminder.mail.notice",
                  "You receive this e-mail because you are involved in {EVENTTITLE}.",
                  { EVENTTITLE: eventTitle },
                )}
              </td>
            </tr>
            <tr>
              <td>
                <a href={unsubLink}>
                  {t("email.base.unsubscribeLink.automatedNotifications", { SITENAME: siteName })}
                </a>
                &nbsp;
                <a href={Router.url("profile", { query: "campaign=eventReminder" })}>
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

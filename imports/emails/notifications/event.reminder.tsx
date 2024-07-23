import React from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";
import { EventModel } from "/imports/api/events/events";
import { EventBox } from "./EventBox";

export type Props = {
  companions: number;
  unsubLink: string;
  event: EventModel;
  unregisterToEventLink: string;
  eventTitle: React.JSX.Element | undefined;
  eventCalendar: string;
  siteName: string;
  username: string;
  campaign: string;
  lng: string;
};

export function EventReminder({
  companions,
  unsubLink,
  event,
  unregisterToEventLink,
  eventTitle,
  eventCalendar,
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
          <EventBox event={event} campaign={campaign} lng={lng} />
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

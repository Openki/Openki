import React, { JSX } from "react";
import { useTranslation } from "react-i18next";
import { EventModel } from "/imports/api/events/events";
import { EventBox } from "./components/EventBox";
import { Footer } from "./components/Footer";
import { Props as UnsubscribeLinkProps } from "./components/UnsubscribeLink";

export interface Props {
  companions: number;
  event: EventModel;
  unregisterToEventLink: string;
  eventTitle: JSX.Element | undefined;
  eventCalendar: string;
  tz: string;
  username: string;
  unsubscribe: Omit<UnsubscribeLinkProps, "lng">;
  campaign: string;
  lng: string;
}

export function EventReminder({
  companions,
  event,
  unregisterToEventLink,
  eventTitle,
  eventCalendar,
  tz,
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
          <h5 className="title">{t("email.base.greeting", { USER: username })}</h5>
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
              "In case you can not make it, it's important to let the coordinators know now:",
            )}
          </p>
          <p className="text-center">
            <a className="button" href={unregisterToEventLink}>
              {t("notification.event.reminder.unregisterEvent", "Un-enroll")}
            </a>
          </p>
          <EventBox event={event} tz={tz} campaign={campaign} lng={lng} />
        </td>
      </tr>
      <Footer
        receiveNote={t(
          "notification.event.reminder.mail.notice",
          "You receive this e-mail because you are involved in {EVENTTITLE}.",
          { EVENTTITLE: eventTitle },
        )}
        unsubscribe={unsubscribe}
        campaign={campaign}
        lng={lng}
      />
    </>
  );
}

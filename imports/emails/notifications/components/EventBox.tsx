import React from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";
import { EventModel } from "/imports/api/events/events";
import { getStartEndDateInTz } from "/imports/startup/both/emails/utils/getStartEndDateInTz";

function getVenueLine(event: EventModel) {
  const { venue } = event;
  let venueLine: string | undefined;
  if (venue) {
    venueLine = [venue.name, venue.address].filter(Boolean).join(", ");
  }
  return venueLine;
}

export function EventBox({
  event,
  tz,
  campaign,
  lng,
}: {
  event: EventModel;
  tz: string;
  campaign: string;
  lng: string;
}) {
  const { startMoment, endMoment } = getStartEndDateInTz(event, tz, lng);
  const eventDate = startMoment.format("dddd, LL");
  const eventStart = startMoment.format("LT");
  const eventEnd = endMoment.format("LT");
  const venueLine = getVenueLine(event);
  const eventLink = Router.url("showEvent", event, { query: { campaign } });
  const profileLink = Router.url("profile", {}, { query: { campaign }, hash: "my-events" });

  const { t } = useTranslation(undefined, { lng });

  return (
    <table className="event">
      <tr>
        <td className="event-header">
          <a href={eventLink}>
            <span className="fw-bold">
              {eventDate}
              <br />
              {eventStart}
              {!!eventEnd && ` - ${eventEnd}`}
            </span>
            {!!venueLine && (
              <>
                <br />
                {venueLine}
              </>
            )}
          </a>
        </td>
      </tr>
      {!!event.canceled && (
        <>
          <tr>
            <td className="event-gap"></td>
          </tr>
          <tr>
            <td className="event-canceled text-center fw-bold">
              {t("notification.mail.event.canceled", "This event got canceled")}
            </td>
          </tr>
          <tr>
            <td className="event-gap"></td>
          </tr>
        </>
      )}
      <tr>
        <td className="event-body">
          <h5 className="title">{event.title}</h5>
          <p dangerouslySetInnerHTML={{ __html: event.description }}></p>
          {!event.canceled && (
            <a className="button event-confirmation-email-button" href={eventLink}>
              {t("notification.mail.event.linkEvent", "Visit Event")}
            </a>
          )}
        </td>
      </tr>
      {!event.canceled && (
        <tr>
          <td className="event-link">
            <a href={profileLink}>
              {t("notification.mail.event.linkCalendar", "Save all my events to my calendar")}
            </a>
            <br />
          </td>
        </tr>
      )}
    </table>
  );
}

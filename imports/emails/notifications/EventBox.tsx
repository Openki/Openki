import React from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";
import { EventModel } from "/imports/api/events/events";
import { getStartEndDate } from "../../notification/utils";

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
  campaign,
  lng,
}: {
  event: EventModel;
  campaign: string;
  lng: string;
}) {
  const { startMoment, endMoment } = getStartEndDate(event, lng);
  const eventDate = startMoment.format("dddd, LL");
  const eventStart = startMoment.format("LT");
  const eventEnd = endMoment.format("LT");
  const venueLine = getVenueLine(event);
  const eventLink = Router.url("showEvent", event, { query: campaign });
  const calLink = Router.url("calEvent", event, { query: campaign });

  const { t } = useTranslation(undefined, { lng });

  return (
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
      {event.canceled ? (
        <>
          <tr>
            <td className="event-gap"></td>
          </tr>
          <tr>
            <td className="event-canceled text-center">
              <strong>{t("notification.mail.event.canceled", "This event got canceled")}</strong>
            </td>
          </tr>
          <tr>
            <td className="event-gap"></td>
          </tr>
        </>
      ) : null}
      <tr>
        <td className="event-body">
          <h5 className="title">{event.title}</h5>
          <p dangerouslySetInnerHTML={{ __html: event.description }}></p>
          {!event.canceled ? (
            <a className="button event-confirmation-email-button" href={eventLink}>
              {t("notification.mail.event.linkEvent", "Visit Event")}
            </a>
          ) : null}
        </td>
      </tr>
      {!event.canceled ? (
        <tr>
          <td className="event-link">
            <a href={calLink}>
              {t("notification.mail.event.linkCalendar", "Add this event to my calendar")}
            </a>
            <br />
          </td>
        </tr>
      ) : null}
    </table>
  );
}

import React from "react";
import { useTranslation } from "react-i18next";
import { EventModel } from "/imports/api/events/events";

export function StatePanel({ event }: { event: EventModel }) {
  const { t } = useTranslation();

  if (event.canceled) {
    return <span className="event-canceled">{t("_event.state.canceled")}</span>;
  }

  if (event.isFullyBooked()) {
    return <span className="event-fully-booked">{t("_event.state.fullyBooked")}</span>;
  }

  return null;
}

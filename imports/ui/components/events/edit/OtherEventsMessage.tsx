import { Router } from "meteor/iron:router";
import React from "react";
import { useTranslation } from "react-i18next";
import { EventModel } from "/imports/api/events/events";
import { ReactJoin } from "/imports/utils/ReactJoin";

export function OtherEventsMessage({ events }: { events: EventModel[] }) {
  const { t } = useTranslation();

  return ReactJoin(
    events.map((e) => (
      <React.Fragment key={e._id}>
        {e.room
          ? t(
              "event.edit.venue.parallelEvents.otherEventInRoom",
              `There is the event "{TITLE}" in room "{ROOM}".`,
              {
                TITLE: (
                  <a href={Router.path("showEvent", e)} target="_blank" rel="noreferrer">
                    {e.title}
                  </a>
                ),
                ROOM: e.room,
              },
            )
          : t("event.edit.venue.parallelEvents.otherEvent", `There is the event "{TITLE}".`, {
              TITLE: (
                <a href={Router.path("showEvent", e)} target="_blank" rel="noreferrer">
                  {e.title}
                </a>
              ),
            })}
      </React.Fragment>
    )),
    <> </>,
  );
}

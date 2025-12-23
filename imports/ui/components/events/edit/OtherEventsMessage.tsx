import React from "react";
import { useTranslation } from "react-i18next";
import { ReactJoin } from "/imports/utils/ReactJoin";

export function OtherEventsMessage({
  events,
}: {
  events: { title: string; room: string; _id: string; url: string }[];
}) {
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
                  <a href={e.url} target="_blank" rel="noreferrer">
                    {e.title}
                  </a>
                ),
                ROOM: e.room,
              },
            )
          : t("event.edit.venue.parallelEvents.otherEvent", `There is the event "{TITLE}".`, {
              TITLE: (
                <a href={e.url} target="_blank" rel="noreferrer">
                  {e.title}
                </a>
              ),
            })}
      </React.Fragment>
    )),
    <> </>,
  );
}

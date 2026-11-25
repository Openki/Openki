import { useTranslation } from "react-i18next";
import { reactJoin } from "../../../../utils/reactJoin";
import { Fragment } from "react";

export function OtherEventsMessage({
  events,
}: {
  events: { title: string; room: string; _id: string; url: string }[];
}) {
  const { t } = useTranslation();

  return reactJoin(
    events.map((e) => (
      <Fragment key={e._id}>
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
      </Fragment>
    )),
    <> </>,
  );
}

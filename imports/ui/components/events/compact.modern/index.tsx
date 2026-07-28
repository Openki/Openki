import React, { useState } from "react";

import { EventModel } from "/imports/api/events/events";

import { Panel } from "../../panel";
import { Full } from "./Full";
import { Thumb } from "./Thumb";

import "./styles.scss";

export interface Props {
  event: EventModel;
  hideCategories?: boolean | undefined;
}

export function EventCompact({ event, hideCategories }: Props) {
  const [view, setView] = useState("");

  return (
    <Panel
      id={event._id}
      onChange={(view) => {
        setView(view);
      }}
      thumb={<Thumb event={event} />}
      full={
        <Full
          event={event}
          animation={view === "full" ? "show" : "hide"}
          hideCategories={hideCategories}
        />
      }
    />
  );
}

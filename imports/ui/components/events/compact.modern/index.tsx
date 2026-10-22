import React from "react";

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
  return (
    <Panel
      id={event._id}
      thumb={<Thumb event={event} />}
      full={<Full event={event} hideCategories={hideCategories} />}
    />
  );
}

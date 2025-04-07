import React from "react";
import { Mongo } from "meteor/mongo";
import { useTranslation } from "react-i18next";
import * as Metatags from "/imports/utils/metatags";

import { EventEntity, EventModel } from "/imports/api/events/events";

import "react-leaflet-fullscreen/styles.css";
import "leaflet/dist/leaflet.css";

import { EventsMap } from "/imports/ui/components/events/map";

import "./styles.scss";

export interface Props {
  events: Mongo.Cursor<EventEntity, EventModel>;
}

export function FrameEventsMapPage(props: Props) {
  const { t } = useTranslation();
  const now = new Date();

  Metatags.setCommonTags(t("frameEventsMap.windowtitle", "Events map"));

  return (
    <EventsMap
      events={props.events.fetch().filter((e) => e.start > now)}
      openLinksInNewTab={true}
      fullscreenControl={false}
    />
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("FrameEventsMapPage", () => FrameEventsMapPage);

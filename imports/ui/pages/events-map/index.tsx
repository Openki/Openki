import React from "react";
import { Mongo } from "meteor/mongo";
import { useTranslation } from "react-i18next";
import * as Metatags from "/imports/utils/metatags";

import { EventEntity, EventModel } from "/imports/api/events/events";
import { useDetails } from "/imports/api/regions/publications";

import { EventsMap } from "/imports/ui/components/events/map";

import "./styles.scss";

export interface Data {
  region: string | undefined;
  events: Mongo.Cursor<EventEntity, EventModel>;
}

export function EventsMapPage(props: Data) {
  const { t } = useTranslation();
  const [isLoading, region] = useDetails(props.region || "-1");
  const now = new Date();

  if (isLoading()) {
    return null;
  }

  Metatags.setCommonTags(t("eventsMap.windowtitle", "Events map"));

  return (
    <div className="container-fluid">
      <h1>
        {region
          ? t("eventsMap.list.titleForRegion", "Events in region {REGION}", {
              REGION: region.name,
            })
          : t("eventsMap.list.title", "Events")}
      </h1>
      <div className="row">
        <div className="col-12">
          <EventsMap
            events={props.events.fetch().filter((e) => e.start > now)}
            openLinksInNewTab={false}
          />
        </div>
      </div>
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("EventsMapPage", () => EventsMapPage);

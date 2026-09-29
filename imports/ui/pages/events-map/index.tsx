import React from "react";
import { Mongo } from "meteor/mongo";
import { useTranslation } from "react-i18next";
import { MetaTags } from "/imports/ui/components/MetaTags";

import { EventEntity, EventModel } from "/imports/api/events/events";
import { useDetails } from "/imports/api/regions/publications";

import { EventsMap } from "/imports/ui/components/events/map";

import "./styles.scss";

export interface Props {
  region: string | undefined;
  events: Mongo.Cursor<EventEntity, EventModel>;
}

export function EventsMapPage(props: Props) {
  const { t } = useTranslation();
  const [isLoading, region] = useDetails(props.region || "-1");
  const now = new Date();

  if (isLoading()) {
    return null;
  }

  return (
    <>
      <MetaTags title={t("eventsMap.windowtitle", "Events map")} />

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
              fullscreenControl
            />
          </div>
        </div>
      </div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("EventsMapPage", () => EventsMapPage);

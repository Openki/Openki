import React from "react";
import { useTranslation } from "react-i18next";
import * as Metatags from "/imports/utils/metatags";
import { Filtering } from "/imports/utils/filtering";
import { useSearchParams } from "/imports/utils/react-meteor-router";
import moment from "moment";

import { useFindFilter } from "/imports/api/events/publications";
import { FindParams } from "/imports/api/events/events";

import { EventsMap } from "/imports/ui/components/events/map";
import { LoadingPage } from "../../loading";

import "./styles.scss";

export function FrameEventsMapPage() {
  const { t } = useTranslation();
  const now = new Date();
  const searchParams = useSearchParams();

  const filter = new Filtering(FindParams);
  filter.read(searchParams);
  const query = filter.toQuery();
  query.after = query.after || moment().startOf("day").toDate();

  const [isLoading, events] = useFindFilter(query);

  Metatags.setCommonTags(t("frameEventsMap.windowtitle", "Events map"));

  if (isLoading()) {
    return <LoadingPage />;
  }

  return (
    <div className="vh-100">
      <EventsMap events={events.filter((e) => e.start > now)} openLinksInNewTab />
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("FrameEventsMapPage", () => FrameEventsMapPage);

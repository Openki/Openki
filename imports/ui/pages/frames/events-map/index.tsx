import React from "react";
import { useTranslation } from "react-i18next";
import { MetaTags } from "/imports/ui/components/MetaTags";
import { Filtering } from "/imports/utils/filtering";
import { useSearchParams } from "/imports/ui/hooks/react-meteor-router";
import { useReactiveNow } from "/imports/utils/reactive-now";

import { useFindFilter } from "/imports/api/events/publications";
import { FindParams } from "/imports/api/events/events";

import { EventsMap } from "/imports/ui/components/events/map";
import { LoadingPage } from "../../loading";

import "./styles.scss";

export function FrameEventsMapPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const now = useReactiveNow();

  const filter = new Filtering(FindParams);
  filter.read(searchParams);
  const query = filter.toQuery();
  query.after = query.after || now;

  const [isLoading, events] = useFindFilter(query);

  if (isLoading()) {
    return <LoadingPage />;
  }

  return (
    <>
      <MetaTags title={t("frameEventsMap.windowtitle", "Events map")} />

      <div className="vh-100">
        <EventsMap events={events} openLinksInNewTab />
      </div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("FrameEventsMapPage", () => FrameEventsMapPage);

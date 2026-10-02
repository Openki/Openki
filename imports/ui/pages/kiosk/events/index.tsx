import React from "react";
import { Mongo } from "meteor/mongo";
import moment from "moment";
import { useSession } from "/imports/ui/hooks/react-meteor-data";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";

import { PublicSettings } from "/imports/utils/PublicSettings";
import { useLocalizedSetting } from "/imports/utils/getLocalizedValue";
import { useSiteName } from "/imports/utils/getSiteName";

import { EventEntity, EventModel, FindFilter } from "/imports/api/events/events";
import { useDetails as useOrganizationDetails } from "/imports/api/organizations/publications";
import { useDetails as useVenueDetails } from "/imports/api/venues/publications";

import { MetaTags } from "/imports/ui/components/MetaTags";
import { List } from "./List";
import { LanguageSelection } from "/imports/ui/components/language-selection";

import "./styles.scss";

function Organization({ organizationId }: { organizationId: string }) {
  const [isLoading, organization] = useOrganizationDetails(organizationId);

  function logo() {
    if (organization) {
      return organization.publicLogoUrl();
    }
    return "";
  }
  function name() {
    if (organization) {
      return organization.name;
    }
    return "";
  }
  if (isLoading()) {
    return null;
  }

  return (
    <a href={Router.path("organizationDetails", organization)}>
      {!!logo() && <img className="kiosk-logo kiosk-logo-organization" src={logo()} />}

      {name()}
    </a>
  );
}

function Venue({ venueId }: { venueId: string }) {
  const [isLoading, venue] = useVenueDetails(venueId);
  function venueName() {
    if (venue) {
      return venue.name;
    }
    return "";
  }

  if (isLoading()) {
    return null;
  }

  return <a href={Router.path("venueDetails", venue)}>{venueName()}</a>;
}

export function KioskEventsPage({
  today,
  future,
  ongoing,
  filter,
}: {
  today: Mongo.Cursor<EventEntity, EventModel>;
  future: Mongo.Cursor<EventEntity, EventModel>;
  ongoing: Mongo.Cursor<EventEntity, EventModel>;
  filter: FindFilter;
}) {
  const { t } = useTranslation();
  const { getLocalizedValue } = useLocalizedSetting();

  const currentRegion = useCurrentRegion();
  const siteName = useSiteName();
  useSession("seconds");

  function showTime() {
    return moment().format("LTS");
  }
  function showDate() {
    return moment().format("LL");
  }

  function headerLogo() {
    let src;

    if (currentRegion?.custom?.headerLogoKiosk?.src) {
      // the region has a custom logo
      src = currentRegion.custom.headerLogoKiosk.src;
    } else {
      // general logo
      src = PublicSettings.headerLogoKiosk.src;
    }

    if (!src) {
      return "";
    }

    if (src.startsWith("data:image/")) {
      // base64 image
      return src;
    }

    if (src.startsWith(PublicSettings.s3.publicUrlBase)) {
      // in our s3 file storage
      return src;
    }

    // in the openki repository folder "public/logo/"
    return `/logo/${src}`;
  }

  function headerAlt() {
    return (
      getLocalizedValue(currentRegion?.custom?.headerLogoKiosk?.alt) ||
      getLocalizedValue(PublicSettings.headerLogoKiosk.alt)
    );
  }

  return (
    <>
      <MetaTags title={t("event.list.windowtitle", "Events")} />

      <div className="kiosk container-fluid">
        <div className="page-component">
          <div className="kiosk-heading">
            {filter.organization ? (
              <Organization organizationId={filter.organization} />
            ) : filter.venue ? (
              <Venue venueId={filter.venue} />
            ) : (
              <a href={Router.path("home")}>
                {!!headerLogo() && (
                  <img
                    src={headerLogo()}
                    alt={headerAlt()}
                    className="kiosk-logo kiosk-logo-brand"
                  />
                )}
                {siteName}
              </a>
            )}
          </div>
          <div className="kiosk-language-selection">
            <LanguageSelection />
          </div>
          <div className="kiosk-moment">
            <span className="kiosk-moment-time">{showTime()}</span>
            <span className="kiosk-moment-date">{showDate()}</span>
          </div>
        </div>
        {ongoing.count() > 0 && (
          <div className="page-component">
            <h3>
              {t(
                "kiosk.ongoing",
                "{NUM, plural, one{One ongoing event:} other{# ongoing events:} }",
                { NUM: ongoing.count() },
              )}
            </h3>
            <List events={ongoing.fetch()} timePeriod="ongoing" />
          </div>
        )}

        {today.count() > 0 && (
          <div className="page-component page-component-seperated">
            <h3>
              {t("kiosk.today", "{NUM, plural, one{One event} other{# events} } later today:", {
                NUM: today.count(),
              })}
            </h3>
            <List events={today.fetch()} timePeriod="today" />
          </div>
        )}
        {future.count() > 0 ? (
          <div className="page-component page-component-seperated">
            <h3>{t("kiosk.future", "Future events:", { NUM: future.count() })}</h3>
            <List events={future.fetch()} timePeriod="upcoming" />
          </div>
        ) : (
          <h3>{t("kiosk.noFutureEvents", "There are no future events")}</h3>
        )}
      </div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("KioskEventsPage", () => KioskEventsPage);

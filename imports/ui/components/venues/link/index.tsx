import React from "react";
import { Router } from "meteor/iron:router";
import { Template } from "meteor/templating";
import { useTranslation } from "react-i18next";

import "./styles.scss";

export type Venue = {
  _id?: string;
  name: string;
  restrictedUse?: boolean | undefined;
  slug?: string;
};

export type Props = {
  venue: Venue;
  room?: string | undefined;
  openInNewTab?: boolean | undefined;
};

function Venue({ name, restrictedUse }: { name: string; restrictedUse?: boolean | undefined }) {
  return (
    <>
      <span
        className={`fa-solid ${!restrictedUse ? "fa-house" : "fa-house-lock"} fa-fw`}
        aria-hidden="true"
      ></span>
      &nbsp;
      {name}
    </>
  );
}

export function VenueTag({
  venue,
  openInNewTab,
}: {
  venue: Venue;
  openInNewTab?: boolean | undefined;
}) {
  const { t } = useTranslation();
  if (venue?._id) {
    return (
      <div className={`tag tag-link venue-tag${venue.restrictedUse ? " venue-locked-tag" : ""}`}>
        <a
          data-bs-toggle="tooltip"
          data-bs-title={t("location.link.tooltip", "Show details of {VENUE}", {
            VENUE: venue.name,
          })}
          href={Router.url("venueDetails", venue)}
          target={openInNewTab ? "_blank" : ""}
        >
          <Venue name={venue.name} restrictedUse={venue.restrictedUse} />
        </a>
      </div>
    );
  }

  return (
    <div className="tag">
      <Venue name={venue?.name} />
    </div>
  );
}

export function RoomTag({ name }: { name: string | undefined }) {
  if (!name) {
    return null;
  }
  return (
    <div className="tag">
      <span className="fa-solid fa-signs-post fa-fw" aria-hidden="true"></span>&nbsp;
      {name}
    </div>
  );
}

export function VenueLink({ venue, room, openInNewTab }: Props) {
  if (!venue?.name) {
    return null;
  }
  return (
    <>
      <VenueTag venue={venue} openInNewTab={openInNewTab} /> <RoomTag name={room} />
    </>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("VenueLink", () => VenueLink);

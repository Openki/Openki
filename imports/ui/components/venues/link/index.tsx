import React from "react";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";
import { Icon } from "../Icon";

import "./styles.scss";

export interface Venue {
  _id?: string;
  name: string;
  restrictedUse?: boolean | undefined;
  slug?: string;
}

export interface Props {
  venue: Venue;
  room?: string | undefined;
  openInNewTab?: boolean | undefined;
}

function Venue({
  id,
  name,
  restrictedUse,
}: {
  id?: string | undefined;
  name: string;
  restrictedUse?: boolean | undefined;
}) {
  return (
    <>
      <Icon id={id} restrictedUse={restrictedUse}></Icon>
      &nbsp;
      {name}
    </>
  );
}

export function VenueTag({
  venue,
  openInNewTab,
  className = "",
}: {
  venue: Venue;
  openInNewTab?: boolean | undefined;
  className?: string | undefined;
}) {
  const { t } = useTranslation();
  const user = useUser();

  function tagClassName() {
    if (!venue.restrictedUse) {
      return "";
    }

    if (venue._id && user?.venues.includes(venue._id)) {
      return "";
    }

    // show disabled only when restricted use and current user is not editor
    return "venue-locked-tag";
  }

  if (venue?._id) {
    return (
      <div className={`tag tag-link ${className} venue-tag ${tagClassName()} fw-light`}>
        <a
          data-bs-title={t("location.link.tooltip", "Show details of {VENUE}", {
            VENUE: venue.name,
          })}
          href={Router.url("venueDetails", venue)}
          target={openInNewTab ? "_blank" : ""}
          rel="noreferrer"
        >
          <Venue id={venue._id} name={venue.name} restrictedUse={venue.restrictedUse} />
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
    <div className="tag fw-light">
      <i className="fa-solid fa-signs-post fa-fw" />
      &nbsp;
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

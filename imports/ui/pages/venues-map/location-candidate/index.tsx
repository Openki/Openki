import { Router } from "meteor/iron:router";
import React from "react";
import { Template } from "meteor/templating";

import { VenueModel } from "/imports/api/venues/venues";

import { MarkerEntity } from "/imports/ui/lib/location-tracker";

export interface Props {
  marker: MarkerEntity & VenueModel;
  handles: {
    onMouseEnter: (id: string) => void;
    onMouseLeave: () => void;
  };
}

export function LocationCandidate({ marker, handles }: Props) {
  return (
    <li
      className={`list-group-item list-group-item-action list-group-item-primary ${
        marker.hover ? "hover" : ""
      }`}
      onClick={() => {
        Router.go("venueDetails", marker);
      }}
      onMouseEnter={() => {
        handles.onMouseEnter(marker._id);
      }}
      onMouseLeave={() => {
        handles.onMouseLeave();
      }}
    >
      {marker.name}
      <div className="address">
        <small>{marker.address}</small>
      </div>
    </li>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("LocationCandidate", () => LocationCandidate);

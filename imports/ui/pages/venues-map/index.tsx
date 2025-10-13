import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Mongo } from "meteor/mongo";
import { Router } from "meteor/iron:router";

import { VenueEntity, VenueModel } from "/imports/api/venues/venues";
import { useDetails } from "/imports/api/regions/publications";

import * as Metatags from "/imports/utils/metatags";

import { LocationCandidate } from "./location-candidate";

import "./styles.scss";

export interface Data {
  region: string | undefined;
  venues: Mongo.Cursor<VenueEntity, VenueModel>;
}

export interface Data {
  region: string | undefined;
  venues: Mongo.Cursor<VenueEntity, VenueModel>;
}

export function VenuesMap({ region: regionId, venues }: Data) {
  const { t } = useTranslation();
  const [isLoading, region] = useDetails(regionId || "-1");

  useEffect(() => {
    Metatags.setCommonTags(t("venue.map.windowtitle", "Venues map"));
  });

  if (isLoading()) {
    return null;
  }

  return (
    <div className="container-fluid">
      <h1>
        {!!region
          ? t("venues.list.titleForRegion", "Venues in region {REGION}", { REGION: region.name })
          : t("venues.list.title", "Venues")}
      </h1>
      <div className="row">
        <div className="col-2 d-none d-md-block">
          {venues.count() > 0 ? (
            <ul className="list-group">
              {/* {venues.map(venue=>
              <LocationCandidate marker={venue} handles={handles}/>

              )} */}
            </ul>
          ) : (
            t("venues.list.noneFound", "No venues found")
          )}
          
          <a
            className="btn btn-secondary mt-3"
            href={Router.path("venueDetails", { _id: "create" })}
          >
            {t("profile.createNewVenue.button")}
          </a>
        </div>
        <div className="col-12 col-md-10 venues-map-location-map">
          {/* {{> map markers=venueMarkers}} */}
        </div>
      </div>
    </div>
  );
}

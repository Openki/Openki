import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Mongo } from "meteor/mongo";
import { Router } from "meteor/iron:router";
import { useSession } from "/imports/utils/react-meteor-data";

import { VenueEntity, VenueModel } from "/imports/api/venues/venues";
import { useDetails } from "/imports/api/regions/publications";

import { MetaTags } from "/imports/ui/components/MetaTags";

import { MapContainer, Marker } from "react-leaflet";
import { RegionMapContainer } from "../../components/location/display/RegionMapContainer";
import { TileLayers } from "../../components/TileLayer";
import { FullscreenControl } from "../../components/FullscreenControl";
import { DivIcon } from "leaflet";
import { isOnCustomMap } from "/imports/utils/isOnCustomMap";
import { AutoInvalidateSize } from "/imports/ui/components/location/display/AutoInvalidateSize";
import { cx } from "/imports/utils/cx";

import "leaflet/dist/leaflet.css";
import "./styles.scss";

export interface Data {
  region: string | undefined;
  venues: Mongo.Cursor<VenueEntity, VenueModel>;
}

export function VenuesMap({ region: regionId, venues }: Data) {
  const { t } = useTranslation();
  const locale = useSession("locale");
  const [selectedVenue, setSelectedVenue] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<number | undefined>(undefined);

  const [isLoading, region] = useDetails(regionId || "-1");

  useEffect(() => {
    setSelectedLevel(region?.map?.defaultLevel);
  }, [region]);

  if (isLoading()) {
    return null;
  }

  const venueMarkerIcon = new DivIcon({
    html: '<span class="fa-solid fa-location-dot" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%)"></span>',
    className: "leaflet-marker-icon-pin",
  });
  const venueMarkerShadowIcon = new DivIcon({
    html: '<span class="fa-solid fa-location-dot" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%)"></span>',
    className: "leaflet-marker-icon-shadow",
  });

  const venueMarkerIconActive = new DivIcon({
    html: '<span class="fa-solid fa-location-dot" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%)"></span>',
    className: "leaflet-marker-icon-pin active",
  });
  const venueMarkerShadowIconActive = new DivIcon({
    html: '<span class="fa-solid fa-location-dot" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%)"></span>',
    className: "leaflet-marker-icon-shadow active",
  });

  const markers = venues
    .fetch()
    .filter(
      (v) =>
        // when show all region: only show venue when not on custom map
        (!region && !isOnCustomMap(v)) ||
        // when only a region: only show venue when not on custom map
        (region && !isOnCustomMap(v)) ||
        // when only a region with a custom map is shown: only show venue on the selected level
        (region && isOnCustomMap(v) && selectedLevel !== undefined && v.level === selectedLevel),
    )
    .map((v) => ({
      _id: v._id,
      loc: { lat: v.loc.coordinates[1], lng: v.loc.coordinates[0] },
      venue: v,
    }));

  const children = (
    <>
      {markers.map((mark) => (
        <React.Fragment key={mark._id}>
          <Marker
            position={mark.loc as any}
            icon={selectedVenue === mark.venue._id ? venueMarkerIconActive : venueMarkerIcon}
            eventHandlers={{
              click: () => {
                Router.go("venueDetails", mark.venue);
              },
              mouseover: () => {
                setSelectedVenue(mark.venue._id);
              },
              mouseout: () => {
                setSelectedVenue("");
              },
            }}
          ></Marker>
          <Marker
            position={mark.loc as any}
            icon={
              selectedVenue === mark.venue._id ? venueMarkerShadowIconActive : venueMarkerShadowIcon
            }
          ></Marker>
        </React.Fragment>
      ))}
      <AutoInvalidateSize />
      <FullscreenControl />
    </>
  );

  return (
    <>
      <MetaTags title={t("venue.map.windowtitle", "Venues map")} />

      <div className="container-fluid">
        <h1>
          {region
            ? t("venues.list.titleForRegion", "Venues in region {REGION}", { REGION: region.name })
            : t("venues.list.title", "Venues")}
        </h1>
        <div className="row">
          <div className="col-2 d-none d-md-block">
            {venues.count() > 0 ? (
              <div className="list-group">
                {venues.map(function (venue) {
                  const levelName = region?.map?.layers.find((l) => l.level === venue.level)?.name;
                  return (
                    <a
                      key={venue._id}
                      href={Router.path("venueDetails", venue)}
                      className={cx(
                        "list-group-item list-group-item-action list-group-item-primary",
                        selectedVenue === venue._id && "active",
                      )}
                      onMouseEnter={() => {
                        setSelectedVenue(venue._id);
                      }}
                      onMouseLeave={() => {
                        setSelectedVenue("");
                      }}
                    >
                      {venue.name} {levelName ? <small>({levelName})</small> : ""}
                      <div className="address">
                        <small>{venue.address}</small>
                      </div>
                    </a>
                  );
                })}
              </div>
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
            {!region ? (
              <MapContainer
                bounds={markers.length > 0 ? (markers.map((mark) => mark.loc) as any) : undefined}
              >
                {TileLayers[locale] || TileLayers.default}
                {children}
              </MapContainer>
            ) : (
              <RegionMapContainer
                region={region._id}
                bounds={markers.length > 0 ? (markers.map((mark) => mark.loc) as any) : undefined}
                onLevelChange={(level) => setSelectedLevel(level)}
              >
                {children}
              </RegionMapContainer>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("VenuesMapPage", () => VenuesMap);

import React from "react";
import { useSession } from "/imports/utils/react-meteor-data";
import { MapContainer, Marker, Popup } from "react-leaflet";
import { DivIcon } from "leaflet";
import { isOnCustomMap } from "/imports/utils/isOnCustomMap";
import { chain } from "lodash-es";

import { EventModel, EventVenueEntity } from "/imports/api/events/events";

import { FullscreenControl } from "../../FullscreenControl";
import "leaflet/dist/leaflet.css";
import { TileLayers } from "../../TileLayer";
import { RegionMapContainer } from "../../location/display/RegionMapContainer";

import { EventList } from "/imports/ui/components/events/list";
import { VenueTag } from "../../venues/link";

import "./styles.scss";

export interface Props {
  events: EventModel[];
  fullscreenControl?: boolean | undefined;
  openLinksInNewTab?: boolean | undefined;
}

function groupBy<T>(array: T[], predicate: (value: T, index: number, array: T[]) => string) {
  return array.reduce(
    (acc, value, index, array) => {
      (acc[predicate(value, index, array)] ||= []).push(value);
      return acc;
    },
    {} as Record<string, T[]>,
  );
}

export function EventsMap({ events, fullscreenControl, openLinksInNewTab }: Props) {
  const locale = useSession("locale");

  const eventMarkerIcon = new DivIcon({
    html: '<span class="fa-solid fa-location-dot" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); font-size: 30px;"></span>',
    className: "leaflet-marker-icon-pin",
  });
  const venueMarkerIcon = new DivIcon({
    html: '<span class="fa-solid fa-location-dot" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%)"></span>',
    className: "leaflet-marker-icon-pin",
  });
  const eventMarkerShadowIcon = new DivIcon({
    html: '<span class="fa-solid fa-location-dot" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); font-size: 30px;"></span>',
    className: "leaflet-marker-icon-shadow",
  });
  const venueMarkerShadowIcon = new DivIcon({
    html: '<span class="fa-solid fa-location-dot" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%)"></span>',
    className: "leaflet-marker-icon-shadow",
  });

  events = events.filter((e) => e.venue?.loc);

  const regions = chain(events)
    .map((e) => e.region)
    .uniq()
    .value();

  events = events.filter((e) => !(regions.length > 1 && e.venue && isOnCustomMap(e.venue)));

  const markers = Object.entries(
    groupBy(
      events.filter((e) => e.venue?._id),
      (e) => e.venue?._id as string,
    ),
  ).map((g) => ({
    _id: g[1][0].venue?._id as string,
    loc: { lat: g[1][0].venue?.loc?.coordinates[1], lng: g[1][0].venue?.loc?.coordinates[0] },
    venue: g[1][0].venue,
    events: g[1],
  }));
  markers.push(
    ...events
      .filter((e) => !e.venue?._id)
      .map((event) => {
        return {
          _id: event._id,
          loc: { lat: event.venue?.loc?.coordinates[1], lng: event.venue?.loc?.coordinates[0] },
          venue: event.venue,
          events: [event],
        };
      }),
  );

  const children = (
    <>
      {markers.map((mark) => (
        <React.Fragment key={mark._id}>
          <Marker
            position={mark.loc as any}
            icon={mark.venue?._id ? venueMarkerIcon : eventMarkerIcon}
          >
            <Popup>
              <h4>
                <VenueTag venue={mark.venue as EventVenueEntity} openInNewTab={openLinksInNewTab} />
              </h4>
              <div className="course-event-list">
                <EventList
                  dataEvents={mark.events}
                  withDate={true}
                  withImage={true}
                  withVenue={false}
                  openInNewTab={openLinksInNewTab}
                />
              </div>
            </Popup>
          </Marker>
          <Marker
            position={mark.loc as any}
            icon={mark.venue?._id ? venueMarkerShadowIcon : eventMarkerShadowIcon}
          ></Marker>
        </React.Fragment>
      ))}
      {!!fullscreenControl && <FullscreenControl />}
    </>
  );

  return (
    <div className="events-map-location-map">
      {regions.length > 1 || regions.length !== 1 ? (
        <MapContainer
          bounds={markers.length > 0 ? (markers.map((mark) => mark.loc) as any) : undefined}
        >
          {TileLayers[locale] || TileLayers.default}
          {children}
        </MapContainer>
      ) : (
        <RegionMapContainer
          region={regions[0]}
          bounds={markers.length > 0 ? (markers.map((mark) => mark.loc) as any) : undefined}
        >
          {children}
        </RegionMapContainer>
      )}
    </div>
  );
}

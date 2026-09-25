import React from "react";
import { useSession } from "/imports/utils/react-meteor-data";
import { MapContainer, Marker, Popup } from "react-leaflet";
import { DivIcon } from "leaflet";
import { isOnCustomMap } from "/imports/utils/isOnCustomMap";
import { chain } from "lodash-es";

import { EventModel, EventVenue, EventVenueRef } from "/imports/api/events/events";
import { isEventVenueRef } from "/imports/api/events/lib/isEventVenueRef";
import { Geodata } from "/imports/api/Geodata";

import { FullscreenControl } from "../../FullscreenControl";
import "leaflet/dist/leaflet.css";
import { TileLayers } from "../../TileLayer";
import { RegionMapContainer } from "../../location/display/RegionMapContainer";

import { EventList } from "/imports/ui/components/events/list";
import { Venue, VenueTag } from "../../venues/link";

import "./styles.scss";

export interface Props {
  events: EventModel[];
  fullscreenControl?: boolean | undefined;
  openLinksInNewTab?: boolean | undefined;
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

  const markers: {
    key: string;
    loc: {
      lat: number;
      lng: number;
    };
    venue: Venue;
    events: EventModel[];
  }[] = chain(events)
    /* TypeGuard is not passed on correctly. */
    .filter((e): e is typeof e & { venue: EventVenueRef } => isEventVenueRef(e.venue))
    .groupBy((e) => e.venue._id)
    .map((events) => {
      const venue = events[0].venue;

      return {
        key: venue._id,
        loc: {
          lat: venue.loc.coordinates[1],
          lng: venue.loc.coordinates[0],
        },
        venue,
        events,
      };
    })
    .value();

  markers.push(
    ...events
      .filter((e) => !isEventVenueRef(e.venue) && e.venue?.loc)
      .map((event) => {
        const venue = event.venue as EventVenue;
        const loc = venue.loc as Geodata;
        return {
          key: event._id,
          loc: { lat: loc.coordinates[1], lng: loc.coordinates[0] },
          venue: venue,
          events: [event],
        };
      }),
  );

  const children = (
    <>
      {markers.map((mark) => (
        <React.Fragment key={mark.key}>
          <Marker
            position={mark.loc}
            icon={isEventVenueRef(mark.venue) ? venueMarkerIcon : eventMarkerIcon}
          >
            <Popup>
              <h4>
                <VenueTag venue={mark.venue} openInNewTab={openLinksInNewTab} />
              </h4>
              <div className="group-event-list">
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
            position={mark.loc}
            icon={isEventVenueRef(mark.venue) ? venueMarkerShadowIcon : eventMarkerShadowIcon}
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

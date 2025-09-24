import React from "react";
import { MapContainer, Marker } from "react-leaflet";
import { DivIcon } from "leaflet";

import "leaflet/dist/leaflet.css";
import { RegionMapContainer } from "./RegionMapContainer";
import { AutoInvalidateSize } from "./AutoInvalidateSize";
import { FullscreenControl } from "../../FullscreenControl";

import "./styles.scss";

export function Display(props: {
  region?: string;
  coordinates: [long: number, lat: number];
  fullscreen?: boolean | undefined;
}) {
  const markerIcon = new DivIcon({
    html: '<span class="fa-solid fa-location-dot" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%)"></span>',
    className: "leaflet-marker-icon-pin",
  });

  const children = (
    <>
      <Marker position={[props.coordinates[1], props.coordinates[0]]} icon={markerIcon} />
      {props.fullscreen && <FullscreenControl />}
      <AutoInvalidateSize />
    </>
  );

  return (
    <div className="location-map">
      {props.region ? (
        <RegionMapContainer
          region={props.region}
          bounds={[[props.coordinates[1], props.coordinates[0]]]}
        >
          {children}
        </RegionMapContainer>
      ) : (
        <MapContainer bounds={[[props.coordinates[1], props.coordinates[0]]]}>
          {children}
        </MapContainer>
      )}
    </div>
  );
}

import React from "react";
import { MapContainer, Marker } from "react-leaflet";
import { useSession } from "/imports/utils/react-meteor-data";
import { DivIcon } from "leaflet";

import { FullscreenControl } from "react-leaflet-fullscreen";
import "react-leaflet-fullscreen/styles.css";
import "leaflet/dist/leaflet.css";
import { TileLayers } from "../../TileLayer";

import "./styles.scss";

export function Display(props: {
  coordinates: [long: number, lat: number];
  fullscreen?: boolean | undefined;
}) {
  const locale = useSession("locale");

  const markerIcon = new DivIcon({
    html: '<span class="fa-solid fa-location-dot" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%)"></span>',
    className: "leaflet-marker-icon-pin",
  });
  return (
    <div className="location-map">
      <MapContainer bounds={[[props.coordinates[1], props.coordinates[0]]]}>
        {TileLayers[locale] || TileLayers.default}
        <Marker position={[props.coordinates[1], props.coordinates[0]]} icon={markerIcon}></Marker>
        {props.fullscreen && <FullscreenControl />}
      </MapContainer>
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("LocationDisplay", () => Display);

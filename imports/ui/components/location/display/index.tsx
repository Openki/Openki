import React, { useEffect } from "react";
import { MapContainer, Marker, useMap } from "react-leaflet";
import { useSession } from "/imports/utils/react-meteor-data";
import { DivIcon } from "leaflet";
import { observeSize } from "/imports/ui/lib/observeHeight";

import "leaflet/dist/leaflet.css";
import { TileLayers } from "../../TileLayer";
import { FullscreenControl } from "../../FullscreenControl";

import "./styles.scss";

function AutoInvalidateSize() {
  const map = useMap();

  useEffect(() => {
    const observer = observeSize(map.getContainer(), () => {
      map.invalidateSize();
    });

    return () => {
      observer.stop();
    };
  });

  return null;
}
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
        <AutoInvalidateSize />
      </MapContainer>
    </div>
  );
}

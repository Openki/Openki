import React, { useState } from "react";
import { MapContainer, Marker } from "react-leaflet";
import { DivIcon } from "leaflet";
import { useSession } from "/imports/ui/hooks/react-meteor-data";

import "leaflet/dist/leaflet.css";
import { RegionMapContainer } from "./RegionMapContainer";
import { AutoInvalidateSize } from "./AutoInvalidateSize";
import { FullscreenControl } from "../../FullscreenControl";
import { TileLayers } from "../../TileLayer";

import "./styles.scss";

export function Display(
  props:
    | {
        coordinates: [long: number, lat: number];
        zoom?: number;
        fullscreen?: boolean | undefined;
      }
    | {
        region: string;
        coordinates: [long: number, lat: number];
        level?: number | number;
        zoom?: number;
        fullscreen?: boolean | undefined;
      },
) {
  const locale = useSession("locale");
  const [level, setLevel] = useState("region" in props && props.level);

  const markerIcon = new DivIcon({
    html: '<span class="fa-solid fa-location-dot" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%)"></span>',
    className: "leaflet-marker-icon-pin",
  });

  const children = (
    <>
      {(!("region" in props) || level === props.level) && (
        <Marker position={[props.coordinates[1], props.coordinates[0]]} icon={markerIcon} />
      )}
      {!!props.fullscreen && <FullscreenControl />}
      <AutoInvalidateSize />
    </>
  );

  return (
    <div className="location-map">
      {"region" in props && props.region ? (
        <RegionMapContainer
          region={props.region}
          level={props.level}
          onLevelChange={(newValue) => {
            setLevel(newValue);
          }}
          {...(props.zoom
            ? { center: [props.coordinates[1], props.coordinates[0]], zoom: props.zoom }
            : {
                bounds: [[props.coordinates[1], props.coordinates[0]]],
              })}
        >
          {children}
        </RegionMapContainer>
      ) : (
        <MapContainer
          {...(props.zoom
            ? { center: [props.coordinates[1], props.coordinates[0]], zoom: props.zoom }
            : {
                bounds: [[props.coordinates[1], props.coordinates[0]]],
              })}
        >
          {TileLayers[locale] || TileLayers.default}
          {children}
        </MapContainer>
      )}
    </div>
  );
}

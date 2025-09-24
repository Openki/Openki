import React, { useRef, useState } from "react";
import { MapContainer, Marker } from "react-leaflet";
import { useSession } from "/imports/utils/react-meteor-data";
import { DivIcon } from "leaflet";
import { useTranslation } from "react-i18next";

import { FullscreenControl } from "../../FullscreenControl";
import "leaflet/dist/leaflet.css";
import { TileLayers } from "../../TileLayer";
import { RegionMapContainer } from "../display/RegionMapContainer";

import "./styles.scss";

const PositionClasses = {
  bottomleft: "leaflet-bottom leaflet-left",
  bottomright: "leaflet-bottom leaflet-right",
  topleft: "leaflet-top leaflet-left",
  topright: "leaflet-top leaflet-right",
} as const;

function IconControl({
  position,
  icons,
  title,
  onClick,
}: {
  position?: keyof typeof PositionClasses;
  icons: [op: string, ic: string];
  title: string;
  onClick: () => void;
}) {
  const positionClass = (position && PositionClasses[position]) || PositionClasses.bottomright;
  return (
    <div className={positionClass}>
      <span className="fa comp-icon leaflet-control" onClick={onClick} title={title}>
        <i className={icons[0]}></i>
        <i
          className={`${icons[1]} fa-lg`}
          style={{
            position: "absolute",
            left: "0.7ex",
            top: "0.7ex",
            opacity: 0.5,
          }}
        ></i>
      </span>
    </div>
  );
}

export type Coordinates = [long: number, lat: number];

export function Edit(props: {
  region?: string | undefined;
  coordinates?: Coordinates | undefined;
  level?: number | undefined;
  center?: Coordinates | undefined;
  maxZoom?: number;
  onChange: (
    newValue: { coordinates: Coordinates | undefined; level?: number | undefined } | undefined,
  ) => void;
}) {
  const { t } = useTranslation();
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [level, setLevel] = useState(props.level);

  const handleDragend = () => {
    const marker = markerRef.current;
    if (marker != null) {
      const latLng = marker.getLatLng();
      props.onChange({ coordinates: [latLng.lng, latLng.lat], level });
    }
  };
  const locale = useSession("locale");

  const markerIcon = new DivIcon({
    html: '<span class="fa-solid fa-location-dot" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%)"></span>',
    className: "leaflet-marker-icon-pin",
  });

  const children = (
    <>
      {props.coordinates ? (
        <>
          <Marker
            ref={markerRef}
            position={[props.coordinates[1], props.coordinates[0]]}
            icon={markerIcon}
            draggable={true}
            eventHandlers={{ dragend: handleDragend }}
          ></Marker>
          <IconControl
            icons={["fa-solid fa-minus", "fa-solid fa-location-dot"]}
            title={t("map.removeMarker", "Remove marker")}
            onClick={() => {
              props.onChange(undefined);
            }}
          />
        </>
      ) : (
        <IconControl
          icons={["fa-solid fa-plus", "fa-solid fa-location-dot"]}
          title={t("map.addMarker", "Set marker")}
          onClick={() => {
            const map = mapRef.current;
            if (map != null) {
              const latLng = map.getCenter();
              props.onChange({ coordinates: [latLng.lng, latLng.lat], level });
            }
          }}
        />
      )}
      <FullscreenControl />
    </>
  );

  return (
    <div className="location-map">
      {props.region ? (
        <RegionMapContainer
          region={props.region}
          ref={mapRef}
          {...(!props.coordinates && !props.center
            ? {}
            : {
                center: [
                  props.coordinates?.[1] || props.center?.[1],
                  props.coordinates?.[0] || props.center?.[0],
                ] as [number, number],
              })}
          level={props.level}
          onLevelChange={(newValue) => {
            setLevel(newValue);
          }}
          zoom={props.maxZoom ? props.maxZoom : props.coordinates ? 19 : 13}
        >
          {children}
        </RegionMapContainer>
      ) : (
        <MapContainer
          ref={mapRef}
          {...(!props.coordinates && !props.center
            ? {}
            : {
                center: [
                  props.coordinates?.[1] || props.center?.[1],
                  props.coordinates?.[0] || props.center?.[0],
                ] as [number, number],
              })}
          zoom={props.maxZoom ? props.maxZoom : props.coordinates ? 19 : 13}
        >
          {TileLayers[locale] || TileLayers.default}
          {children}
        </MapContainer>
      )}
    </div>
  );
}

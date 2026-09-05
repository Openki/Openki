import React, { useRef, useState } from "react";
import { MapContainer, Marker } from "react-leaflet";
import { useSession } from "/imports/utils/react-meteor-data";
import { DivIcon } from "leaflet";
import { useTranslation } from "react-i18next";

import { cx } from "/imports/utils/cx";

import { FullscreenControl } from "../../FullscreenControl";
import "leaflet/dist/leaflet.css";
import { TileLayers } from "../../TileLayer";
import { RegionMapContainer } from "../display/RegionMapContainer";
import { ClassName } from "./ClassName";
import { Props } from "./Props";
import { Events } from "./Events";
import { AutoInvalidateSize } from "../display/AutoInvalidateSize";

import "./styles.scss";

const PositionClasses = {
  bottomleft: "leaflet-bottom leaflet-left",
  bottomright: "leaflet-bottom leaflet-right",
  topleft: "leaflet-top leaflet-left",
  topright: "leaflet-top leaflet-right",
} as const;

function IconControl({
  "data-test": dataTest,
  position,
  icons,
  title,
  onClick,
}: {
  "data-test"?: string;
  position?: keyof typeof PositionClasses;
  icons: [op: string, ic: string];
  title: string;
  onClick: () => void;
}) {
  const positionClass = (position && PositionClasses[position]) || PositionClasses.bottomright;
  return (
    <div className={positionClass}>
      <a
        data-test={dataTest}
        className="fa comp-icon leaflet-control text-body"
        title={title}
        href="#"
        onClick={onClick}
      >
        <i className={icons[0]} />
        <i
          className={cx(icons[1], "fa-lg")}
          style={{
            position: "absolute",
            left: "0.7ex",
            top: "0.7ex",
            opacity: 0.5,
          }}
        />
      </a>
    </div>
  );
}

export type Coordinates = [long: number, lat: number];

export function Edit(
  props: {
    id?: string | undefined;
    className?: string | undefined;
    region?: string | undefined;
    level?: number | undefined;
    required?: boolean | undefined;
    "aria-labelledby"?: string | undefined;
    "aria-describedby"?: string | undefined;
    "aria-invalid"?: boolean | undefined;
    onChange: (
      newValue: { coordinates: Coordinates | undefined; level?: number | undefined } | undefined,
    ) => void;
    onFocus?: (() => void) | undefined;
    onBlur?: (() => void) | undefined;
  } & (
    | {
        coordinates?: Coordinates | undefined;
        center: Coordinates;
      }
    | {
        coordinates: Coordinates;
        center?: Coordinates | undefined;
      }
  ),
) {
  const { t } = useTranslation();
  const mapRef = useRef<L.Map>(null);
  const markerRef = useRef<L.Marker<any>>(null);
  const [level, setLevel] = useState(props.level);

  function toGeoJson(marker: L.Marker<any>): Coordinates {
    const latLng = marker.getLatLng();
    return [latLng.lng, latLng.lat];
  }

  const handleDragend = () => {
    if (!markerRef.current) return;
    props.onChange({
      coordinates: toGeoJson(markerRef.current),
      level: level,
    });
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
            data-test="location-edit-remove-marker"
            icons={["fa-solid fa-minus", "fa-solid fa-location-dot"]}
            title={t("map.removeMarker", "Remove marker")}
            onClick={() => {
              props.onChange(undefined);
            }}
          />
        </>
      ) : (
        <IconControl
          data-test="location-edit-add-marker"
          icons={["fa-solid fa-plus", "fa-solid fa-location-dot"]}
          title={t("map.addMarker", "Set marker")}
          onClick={() => {
            const map = mapRef.current;
            if (!map) return;
            const latLng = map.getCenter();
            props.onChange({ coordinates: [latLng.lng, latLng.lat], level });
          }}
        />
      )}
      <ClassName value={`location-map focus-ring ${props.className}`} />
      <Props
        id={props.id}
        aria-labelledby={props["aria-labelledby"]}
        aria-describedby={props["aria-describedby"]}
        aria-invalid={props["aria-invalid"]}
        aria-required={props.required}
      />
      <Events onFocus={props.onFocus} onBlur={props.onBlur} />
      <AutoInvalidateSize />
      <FullscreenControl />
    </>
  );

  return props.region ? (
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

        if (!markerRef.current) return;
        props.onChange({
          coordinates: toGeoJson(markerRef.current),
          level: newValue,
        });
      }}
      zoom={props.coordinates ? 19 : 13}
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
      zoom={props.coordinates ? 19 : 13}
    >
      {TileLayers[locale] || TileLayers.default}
      {children}
    </MapContainer>
  );
}

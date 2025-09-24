import React, { useRef, useState } from "react";
import { Marker } from "react-leaflet";

import { Geodata } from "/imports/api/regions/regions";

import { DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { RegionMapContainer } from "../../../location/display/RegionMapContainer";

import "./styles.scss";

interface Value {
  location: Geodata;
  level?: number | undefined;
}

export function Map({
  region,
  value,
  onChange,
}: {
  region: string;
  value: Value;
  onChange: (value: Value) => void;
}) {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [level, setLevel] = useState(value.level);

  const handleDragend = () => {
    const marker = markerRef.current;
    if (marker != null) {
      const latLng = marker.getLatLng();
      onChange({
        location: {
          type: "Point" as const,
          coordinates: [latLng.lng, latLng.lat],
        },
        level,
      });
    }
  };

  const markerIcon = new DivIcon({
    html: '<span class="fa-solid fa-location-dot" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%)"></span>',
    className: "leaflet-marker-icon-pin",
  });
  return (
    <div className="edit-venue-map">
      <RegionMapContainer
        region={region}
        ref={mapRef}
        center={[value.location.coordinates[1], value.location.coordinates[0]]}
        level={value.level}
        onLevelChange={(newValue) => {
          setLevel(newValue);
        }}
        zoom={19}
      >
        <Marker
          ref={markerRef}
          position={[value.location.coordinates[1], value.location.coordinates[0]]}
          icon={markerIcon}
          draggable={true}
          eventHandlers={{ dragend: handleDragend }}
        />
      </RegionMapContainer>
    </div>
  );
}

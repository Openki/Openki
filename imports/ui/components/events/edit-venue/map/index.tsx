import React, { useRef } from "react";
import { Marker } from "react-leaflet";

import { Geodata } from "/imports/api/regions/regions";

import { DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { RegionMapContainer } from "../../../location/display/RegionMapContainer";

import "./styles.scss";

export function Map({
  region,
  value,
  onChange,
}: {
  region: string;
  value: Geodata;
  onChange: (value: Geodata) => void;
}) {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const handleDragend = () => {
    const marker = markerRef.current;
    if (marker != null) {
      const latLng = marker.getLatLng();
      onChange({
        type: "Point",
        coordinates: [latLng.lng, latLng.lat],
      } as Geodata);
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
        center={[value.coordinates[1], value.coordinates[0]]}
        zoom={19}
      >
        <Marker
          ref={markerRef}
          position={[value.coordinates[1], value.coordinates[0]]}
          icon={markerIcon}
          draggable={true}
          eventHandlers={{ dragend: handleDragend }}
        />
      </RegionMapContainer>
    </div>
  );
}

import { type LatLngBoundsExpression, type LatLngExpression, CRS, type Map } from "leaflet";
import React, { ReactNode } from "react";
import { MapContainer, LayersControl, TileLayer, useMapEvent } from "react-leaflet";
import { TileLayers } from "../../TileLayer";
import { useDetails } from "/imports/api/regions/publications";
import { useSession } from "/imports/ui/hooks/react-meteor-data";

function LayerEventListener({ onChange }: { onChange: (newValue: string) => void }) {
  useMapEvent("baselayerchange", (event) => {
    onChange(event.name);
  });

  return null; // hidden Element
}

export function RegionMapContainer({
  region: regionId,
  ref,
  bounds,
  center,
  zoom,
  level,
  onLevelChange,
  children,
}: {
  region: string;
  ref?: React.Ref<Map> | undefined;
  level?: number | undefined;
  onLevelChange?: (newValue: number) => void;
  children: ReactNode;
} & (
  | {
      center: LatLngExpression;
      zoom: number;
      bounds?: undefined;
    }
  | {
      center?: undefined;
      zoom?: undefined;
      bounds: LatLngBoundsExpression;
    }
)) {
  const locale = useSession("locale");
  const [isLoading, region] = useDetails(regionId);

  if (isLoading()) {
    return null;
  }

  if (!region?.map) {
    return (
      <MapContainer ref={ref} bounds={bounds as LatLngBoundsExpression} center={center} zoom={zoom}>
        {TileLayers[locale] || TileLayers.default}
        {children}
      </MapContainer>
    );
  }

  const { map } = region;
  return (
    <MapContainer
      ref={ref}
      bounds={bounds as LatLngBoundsExpression}
      center={center}
      zoom={zoom}
      maxZoom={map.maxZoom}
      crs={region.map.crs === "Simple" ? CRS.Simple : undefined}
    >
      <LayersControl position="topright" collapsed={false} hideSingleBase>
        {region.map.layers.map((l) => (
          <LayersControl.BaseLayer
            key={l.level}
            checked={level !== undefined ? level === l.level : map.defaultLevel === l.level}
            name={l.name}
          >
            <TileLayer attribution={map.attribution} url={l.tileUrl} noWrap />
          </LayersControl.BaseLayer>
        ))}
      </LayersControl>
      <LayerEventListener
        onChange={(name) => {
          const layer = map.layers.find((l) => l.name === name);

          if (!layer) {
            throw new Error("Unexpected falsy: layer");
          }

          if (onLevelChange) onLevelChange(layer.level);
        }}
      />
      {children}
    </MapContainer>
  );
}

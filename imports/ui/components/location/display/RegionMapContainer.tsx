import { LatLngBoundsExpression, LatLngExpression, CRS } from "leaflet";
import React from "react";
import { MapContainer, LayersControl, TileLayer } from "react-leaflet";
import { TileLayers } from "../../TileLayer";
import { useDetails } from "/imports/api/regions/publications";
import { useSession } from "/imports/utils/react-meteor-data";

export function RegionMapContainer({
  region: regionId,
  ref,
  bounds,
  center,
  zoom,
  children,
}: {
  region: string;
  ref?: any | undefined;
  bounds?: LatLngBoundsExpression | undefined;
  center?: LatLngExpression | undefined;
  zoom?: number | undefined;
  children: any;
}) {
  const locale = useSession("locale");
  const [isLoading, region] = useDetails(regionId);

  if (isLoading()) {
    return null;
  }

  if (!region?.map) {
    return (
      <MapContainer ref={ref} bounds={bounds as any} center={center as any} zoom={zoom as any}>
        {TileLayers[locale] || TileLayers.default}
        {children}
      </MapContainer>
    );
  }

  const { map } = region;
  return (
    <MapContainer
      ref={ref}
      bounds={bounds as any}
      center={center as any}
      zoom={zoom as any}
      maxZoom={map.maxZoom as any}
      crs={region.map.crs === "Simple" ? CRS.Simple : (undefined as any)}
    >
      <LayersControl position="topright" collapsed={false}>
        {region.map.layers.map((l) => (
          <LayersControl.BaseLayer
            key={l.level}
            checked={map.defaultLevel === l.level}
            name={l.name}
          >
            <TileLayer attribution={map.attribution} url={l.tileUrl} />
          </LayersControl.BaseLayer>
        ))}
      </LayersControl>
      {children}
    </MapContainer>
  );
}

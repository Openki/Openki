export function geoLocationLink(loc: { coordinates: [number, number] }) {
  return `geo:${loc?.coordinates?.[1]},${loc?.coordinates?.[0]}`;
}

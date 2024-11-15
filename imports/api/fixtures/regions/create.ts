import { RegionEntity, Regions } from "../../regions/regions";
import { ensure } from "../ensureFixture";
import { Prng } from "../Prng";
import { regions } from "./data";

export function regionsCreate() {
  const userKopf = ensure.user("Kopf", undefined, true)._id;

  const prng = Prng("createRegions");
  regions.forEach((r) => {
    const region = {
      ...r,
      tenant: prng() > 0.3 ? ensure.tenant("Hmmm") : ensure.tenant("Kopf", userKopf),
    } as unknown as RegionEntity; // clone
    if (r.loc) {
      const coordinates = r.loc.reverse(); // GeoJSON takes latitude first
      region.loc = { type: "Point", coordinates: coordinates as [long: number, lat: number] };
    }
    Regions.insert(region);
  });

  return `Inserted ${regions.length} region fixtures.`;
}

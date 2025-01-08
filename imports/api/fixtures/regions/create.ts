/* eslint-disable no-await-in-loop */
import { RegionEntity, Regions } from "../../regions/regions";
import { ensure } from "../ensureFixture";
import { Prng } from "../Prng";
import { regions } from "./data";

export async function create() {
  const userKopf = (await ensure.user("Kopf", undefined, true))._id;

  const prng = Prng("createRegions");
  for (const r of regions) {
    const region = {
      ...r,
      // eslint-disable-next-line no-nested-ternary
      tenant: r.tenant
        ? await ensure.tenant(r.tenant)
        : prng() > 0.3
        ? await ensure.tenant("Hmmm")
        : await ensure.tenant("Kopf", userKopf),
    } as unknown as RegionEntity; // clone
    if (r.loc) {
      const coordinates = r.loc.reverse(); // GeoJSON takes latitude first
      region.loc = { type: "Point", coordinates: coordinates as [long: number, lat: number] };
    }
    if (r.calendarStartDate) {
      const startDate = new Date();
      startDate.setHours(0);
      startDate.setMinutes(0);
      startDate.setSeconds(0);
      // simulate that we start two days after begining
      startDate.setDate(startDate.getDate() - 2);
      region.calendarStartDate = startDate;
    }
    if (r.defaultTeamGroup) {
      region.defaultTeamGroup = await ensure.group(r.defaultTeamGroup);
    }
    await Regions.insertAsync(region);
  }

  return `Inserted ${regions.length} region fixtures.`;
}

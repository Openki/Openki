import { RegionEntity, Regions } from "/imports/api/regions/regions";

export async function update() {
  let updated = 0;

  for (const originalRegion of await Regions.find().fetchAsync()) {
    const region = { ...originalRegion } as RegionEntity & {
      defaultTeamGroups?: RegionEntity["defaultTeamOrganizations"];
    };

    if (region.defaultTeamGroups) {
      region.defaultTeamOrganizations = region.defaultTeamGroups;
      delete region.defaultTeamGroups;

      updated += await Regions.updateAsync(region._id, region);
    }
  }

  return updated;
}

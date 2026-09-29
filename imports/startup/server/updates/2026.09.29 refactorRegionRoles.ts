import { Regions } from "/imports/api/regions/regions";

export async function update() {
  let updated = 0;

  for (const originalRegion of await Regions.find({ roles: { $exists: true } }).fetchAsync()) {
    const region = { ...originalRegion };
    region.roles = (region.roles as unknown as { type: string }[]).map(({ type, ...r }) => {
      return {
        id: type,
        ...r,
      };
    }) as any;

    updated += await Regions.updateAsync(region._id, region);
  }

  return updated;
}

import { Organizations } from "/imports/api/organizations/organizations";
import { Regions } from "/imports/api/regions/regions";

export async function update() {
  let updated = 0;

  for (const originalRegion of await Regions.find().fetchAsync()) {
    const region = { ...originalRegion };

    if (region.dashboard) {
      region.dashboard
        .filter((e) => (e.entity as string) === "course")
        .forEach((e) => {
          e.entity = "group";
        });
      region.dashboard
        .filter((e) => (e.entity as string) === "courseWithoutPropose")
        .forEach((e) => {
          e.entity = "groupWithoutPropose";
        });

      updated += await Regions.updateAsync(region._id, region);
    }
  }

  for (const originalOrganization of await Organizations.find().fetchAsync()) {
    const organization = { ...originalOrganization };

    if (organization.dashboard) {
      organization.dashboard
        .filter((e) => (e.entity as string) === "course")
        .forEach((e) => {
          e.entity = "group";
        });
      organization.dashboard
        .filter((e) => (e.entity as string) === "courseWithoutPropose")
        .forEach((e) => {
          e.entity = "groupWithoutPropose";
        });

      updated += await Organizations.updateAsync(organization._id, organization);
    }
  }

  return updated;
}

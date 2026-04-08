import { OrganizationEntity, Organizations } from "/imports/api/organizations/organizations";
import { RegionEntity, Regions } from "/imports/api/regions/regions";

export async function update() {
  let updated = 0;

  for (const originalRegion of await Regions.find().fetchAsync()) {
    const region = { ...originalRegion } as RegionEntity & {
      courseCount?: RegionEntity["groupCount"];
      custom: {
        courseBackgroundImages?: string[];
      };
    };

    // courseCount => groupCount
    if (region.courseCount) {
      region.groupCount = region.courseCount;
    }
    delete region.courseCount;

    // courseBackgroundImages => groupBackgroundImages
    if (region.custom?.courseBackgroundImages) {
      region.custom.groupBackgroundImages = region.custom.courseBackgroundImages;
      delete region.custom.courseBackgroundImages;
    }

    updated += await Regions.updateAsync(region._id, region);
  }

  for (const originalOrganization of await Organizations.find().fetchAsync()) {
    const organization = { ...originalOrganization } as OrganizationEntity & {
      customCourseFields?: OrganizationEntity["customGroupFields"];
      custom: {
        courseBackgroundImages?: string[];
      };
    };

    // customCourseFields => customGroupFields
    if (organization.customCourseFields) {
      organization.customGroupFields = organization.customCourseFields;
    }
    delete organization.customCourseFields;

    updated += await Organizations.updateAsync(organization._id, organization);
  }

  return updated;
}

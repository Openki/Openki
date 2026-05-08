import { Organizations } from "/imports/api/organizations/organizations";
import * as FileStorage from "/imports/utils/FileStorage";

export async function update() {
  await FileStorage.renameDirectory("groups", "organizations");

  let updated = 0;

  for (const originalOrganization of await Organizations.find({
    logoUrl: { $exists: true },
  }).fetchAsync()) {
    const organization = { ...originalOrganization };

    organization.logoUrl = (organization.logoUrl as string).replace(/^groups/, "organizations");

    updated += await Organizations.updateAsync(organization._id, organization);
  }

  return updated;
}

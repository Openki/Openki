import { i18n } from "/imports/startup/both/i18next";
import { OrganizationModel } from "/imports/api/organizations/organizations";

export function name(organization: OrganizationModel | undefined) {
  if (!organization) {
    return i18n("organization.missing", "Organization does not exist");
  }
  return organization.name;
}

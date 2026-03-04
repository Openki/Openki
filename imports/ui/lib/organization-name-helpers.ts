import { i18n } from "/imports/startup/both/i18next";
import { Template } from "meteor/templating";

import { OrganizationModel, Organizations } from "../../api/organizations/organizations";

export function name(organization: OrganizationModel | undefined) {
  if (!organization) {
    return i18n("organization.missing", "Organization does not exist");
  }
  return organization.name;
}

function subbedOrganization(organizationId: string) {
  Template.instance().subscribe("group", organizationId);
  return Organizations.findOne(organizationId);
}

export const OrganizationNameHelpers = {
  name(organizationId: string) {
    if (!organizationId) {
      return false;
    }
    const organization = subbedOrganization(organizationId);
    return name(organization);
  },
};

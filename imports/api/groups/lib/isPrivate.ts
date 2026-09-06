import { PublicSettings } from "/imports/utils/PublicSettings";

export function isPrivate(group: { tenant: string }) {
  return !PublicSettings.publicTenants.includes(group.tenant);
}

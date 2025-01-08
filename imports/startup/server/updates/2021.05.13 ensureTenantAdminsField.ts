import { Tenants } from "/imports/api/tenants/tenants";

export async function update() {
  let updated = 0;

  updated += await Tenants.updateAsync({}, { $set: { admins: [] } }, { multi: true });

  return updated;
}

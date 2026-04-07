import { Meteor } from "meteor/meteor";
import { Tenants } from "/imports/api/tenants/tenants";
import { Regions } from "/imports/api/regions/regions";
import { Groups } from "/imports/api/courses/courses";
import { Events } from "/imports/api/events/events";
import { Users } from "/imports/api/users/users";

export async function update() {
  let updated = 0;

  const tenantId = await Tenants.insertAsync({
    name: Meteor.settings.public.siteName,
    members: [],
  } as any);

  updated += 1;

  updated += await Regions.updateAsync({}, { $set: { tenant: tenantId } }, { multi: true });
  updated += await Groups.updateAsync({}, { $set: { tenant: tenantId } }, { multi: true });
  updated += await Events.updateAsync({}, { $set: { tenant: tenantId } }, { multi: true });
  updated += await Users.updateAsync({}, { $set: { tenants: [] } }, { multi: true });

  return updated;
}

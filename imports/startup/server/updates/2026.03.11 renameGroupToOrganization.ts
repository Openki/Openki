import { GroupEntity, Groups } from "/imports/api/courses/courses";
import { EventEntity, Events } from "/imports/api/events/events";
import { RegionEntity, Regions } from "/imports/api/regions/regions";

export async function update() {
  let updated = 0;

  for (const originalRegion of await Regions.find().fetchAsync()) {
    const region = { ...originalRegion } as RegionEntity & {
      defaultTeamGroups?: RegionEntity["defaultTeamOrganizations"];
    };

    if (region.defaultTeamGroups) {
      region.defaultTeamOrganizations = region.defaultTeamGroups;
    }
    delete region.defaultTeamGroups;

    updated += await Regions.updateAsync(region._id, region);
  }

  for (const originalEvent of await Events.find().fetchAsync()) {
    const event = { ...originalEvent } as EventEntity & {
      groupOrganizers?: EventEntity["teamOrganizations"];
    };

    if (event.groupOrganizers) {
      event.teamOrganizations = event.groupOrganizers;
    }
    delete event.groupOrganizers;

    updated += await Events.updateAsync(event._id, event);
  }

  for (const originalGroup of await Groups.find().fetchAsync()) {
    const group = { ...originalGroup } as GroupEntity & {
      groupOrganizers?: GroupEntity["teamOrganizations"];
    };

    if (group.groupOrganizers) {
      group.teamOrganizations = group.groupOrganizers;
    }
    delete group.groupOrganizers;

    if (group.history) {
      group.history
        .filter((e) => e.type === "groupPromote")
        .forEach((e) => {
          e.type = "organizationPromote";
        });

      group.history
        .filter((e) => e.type === "groupOrga")
        .forEach((e) => {
          e.type = "organizationTeam";
        });
    }

    updated += await Groups.updateAsync(group._id, group);
  }

  return updated;
}

import { EventEntity, Events } from "/imports/api/events/events";

export async function update() {
  let updated = 0;

  for (const originalEvent of await Events.find().fetchAsync()) {
    const event = { ...originalEvent } as EventEntity & {
      courseGroups?: EventEntity["groupOrganizations"];
      allGroups?: EventEntity["allOrganizations"];
    };

    // courseGroups => groupOrganizations
    if (event.courseGroups) {
      event.groupOrganizations = event.courseGroups;
    }
    delete event.courseGroups;

    // allGroups => allOrganizations
    if (event.allGroups) {
      event.allOrganizations = event.allGroups;
    }
    delete event.allGroups;

    updated += await Events.updateAsync(event._id, event);
  }

  return updated;
}

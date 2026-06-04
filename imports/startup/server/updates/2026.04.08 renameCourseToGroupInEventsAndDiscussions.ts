import { EventEntity, Events } from "/imports/api/events/events";
import {
  GroupDiscussionEntity,
  GroupDiscussions,
} from "/imports/api/group-discussions/group-discussions";

export async function update() {
  let updated = 0;

  for (const originalEvent of await Events.find().fetchAsync()) {
    const event = { ...originalEvent } as EventEntity & {
      courseId?: EventEntity["groupId"];
      courseOrganizations?: EventEntity["groupOrganizations"];
      courseImage?: EventEntity["groupImage"];
    };

    // courseId => groupId
    if (event.courseId) {
      event.groupId = event.courseId;
    }
    delete event.courseId;

    // courseOrganizations => groupOrganizations
    if (event.courseOrganizations) {
      event.groupOrganizations = event.courseOrganizations;
    }
    delete event.courseOrganizations;

    // courseImage => groupImage
    if (event.courseImage) {
      event.groupImage = event.courseImage;
    }
    delete event.courseImage;

    updated += await Events.updateAsync(event._id, event);
  }

  for (const originalGroupDiscussion of await GroupDiscussions.find().fetchAsync()) {
    const groupDiscussion = { ...originalGroupDiscussion } as GroupDiscussionEntity & {
      courseId?: GroupDiscussionEntity["groupId"];
    };

    // courseId => groupId
    if (groupDiscussion.courseId) {
      groupDiscussion.groupId = groupDiscussion.courseId;
    }
    delete groupDiscussion.courseId;

    updated += await GroupDiscussions.updateAsync(groupDiscussion._id, groupDiscussion);
  }

  return updated;
}

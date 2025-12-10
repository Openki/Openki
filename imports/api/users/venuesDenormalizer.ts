import { Users } from "./users";
import { sum } from "../../utils/sum";
import { VenueModel, Venues } from "../venues/venues";
import { GroupModel, Groups } from "../organizations/organizations";

// Based on the guide from meteor: https://guide.meteor.com/collections.html#abstracting-denormalizers

async function updateAll() {
  const venues = await Venues.find(
    {},
    {
      projection: { _id: 1, editor: 1, editGroup: 1 },
    },
  ).fetchAsync();

  const updated = sum(
    await Promise.all(
      await Users.find({}, { projection: { _id: 1, groups: 1 } }).mapAsync((u) => {
        const userVenues = venues
          .filter((v) => v.editor === u._id || (v.editGroup && u.groups.includes(v.editGroup)))
          .map((v) => v._id);

        return Users.updateAsync(u._id, { $set: { venues: userVenues } });
      }),
    ),
  );

  return updated;
}

export async function onDbMigrate() {
  return updateAll();
}

export async function onStartUp() {
  const updated = await updateAll();

  console.log(`users.venuesDenormalizer.onStartUp: ${updated} affected users`);
}

export async function afterVenueCreate(venueId: string, userId: string) {
  await Users.updateAsync(userId, { $addToSet: { venues: venueId } });
}

export async function beforeVenueRemove(venue: VenueModel) {
  // Remove from editor user
  await Users.updateAsync(venue.editor, { $pull: { venues: venue._id } });

  // Remove from all group members of edit group
  if (!venue.editGroup) {
    return;
  }
  const group = await Groups.findOneAsync(venue.editGroup);
  if (!group) {
    throw new Error("Unexpected falsy: group");
  }

  if (group.members.length === 0) {
    return;
  }

  await Users.updateAsync(
    { _id: { $in: group.members.map((m) => m.user) } },
    { $pull: { venues: venue._id } },
  );
}

export async function afterVenueAddEditGroup(venueId: string, groupId: string) {
  const group = await Groups.findOneAsync(groupId);
  if (!group) {
    throw new Error("Unexpected falsy: group");
  }

  if (group.members.length === 0) {
    return;
  }

  await Users.updateAsync(
    { _id: { $in: group.members.map((m) => m.user) } },
    { $addToSet: { venues: venueId } },
  );
}

export async function afterVenueRemoveEditGroup(venueId: string, groupId: string) {
  const group = await Groups.findOneAsync(groupId);
  if (!group) {
    throw new Error("Unexpected falsy: group");
  }

  if (group.members.length === 0) {
    return;
  }

  await Users.updateAsync(
    { _id: { $in: group.members.map((m) => m.user) } },
    { $pull: { venues: venueId } },
  );
}

export async function afterGroupAddMember(userId: string, group: GroupModel) {
  if (!group.venues || group.venues.length === 0) {
    return;
  }

  await Users.updateAsync(userId, {
    $addToSet: { venues: { $each: group.venues.map((v) => v._id) } },
  });
}

export async function afterGroupRemoveMember(userId: string, group: GroupModel) {
  if (!group.venues || group.venues.length === 0) {
    return;
  }

  await Promise.all(
    group.venues.map(async (v) => {
      const venue = await Venues.findOneAsync(v._id);
      if (!venue) {
        throw new Error("Unexpected falsy: venue");
      }

      // if user is editor of venue keep the rights
      if (venue.editor === userId) {
        return;
      }
      await Users.updateAsync(userId, { $pull: { venues: v._id } });
    }),
  );
}

export async function beforeGroupRemove(group: GroupModel) {
  if (group.members.length === 0) {
    return;
  }

  if (!group.venues || group.venues.length === 0) {
    return;
  }

  await Promise.all(
    group.venues.map(async (v) => {
      const venue = await Venues.findOneAsync(v._id);
      if (!venue) {
        throw new Error("Unexpected falsy: venue");
      }

      // if user is editor of venue keep the rights
      const members = group.members.map((m) => m.user).filter((m) => m !== venue.editor);
      if (members.length === 0) {
        return;
      }
      await Users.updateAsync({ _id: { $in: members } }, { $pull: { venues: v._id } });
    }),
  );
}

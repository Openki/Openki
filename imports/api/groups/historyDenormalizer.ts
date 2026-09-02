import { GroupCustomRole, GroupEntity, Groups } from "./groups";
import { UserEntity } from "/imports/api/users/users";

export async function afterUpdate(groupId: string, userId: string) {
  await Groups.updateAsync(groupId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "updated",
        data: { updatedBy: userId },
      },
    },
  });
}

export async function afterUpdateImage(groupId: string, userId: string) {
  await Groups.updateAsync(groupId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "updated",
        data: { updatedBy: userId },
      },
    },
  });
}

export async function afterDeleteImage(groupId: string, userId: string) {
  await Groups.updateAsync(groupId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "updated",
        data: { updatedBy: userId },
      },
    },
  });
}

export async function afterSubscribeToRole(groupId: string, userId: string, roleId: string) {
  await Groups.updateAsync(groupId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "userSubscribed",
        data: { user: userId, role: roleId },
      },
    },
  });
}

export async function afterUnsubscribeFromRole(groupId: string, userId: string, roleId: string) {
  await Groups.updateAsync(groupId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "userUnsubscribed",
        data: { user: userId, role: roleId },
      },
    },
  });
}

export async function afterSubscribeToCustomRole(
  groupId: GroupEntity["_id"],
  userId: UserEntity["_id"],
  roleLabel: GroupCustomRole["label"],
) {
  await Groups.updateAsync(groupId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "userSubscribedToCustomRole",
        data: { user: userId, role: roleLabel },
      },
    },
  });
}

export async function afterUnsubscribeFromCustomRole(
  groupId: GroupEntity["_id"],
  userId: UserEntity["_id"],
  roleLabel: GroupCustomRole["label"],
) {
  await Groups.updateAsync(groupId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "userUnsubscribedFromCustomRole",
        data: { user: userId, role: roleLabel },
      },
    },
  });
}

export async function afterOrganizationPromoteUpdate(
  groupId: string,
  organizationId: string,
  enable: boolean,
  userId: string,
) {
  await Groups.updateAsync(groupId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "organizationPromote",
        data: { user: userId, organization: organizationId, enable },
      },
    },
  });
}
export async function afterOrganizationTeamUpdate(
  groupId: string,
  organizationId: string,
  enable: boolean,
  userId: string,
) {
  await Groups.updateAsync(groupId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "organizationTeam",
        data: { user: userId, organization: organizationId, enable },
      },
    },
  });
}

export async function afterEventInsert(
  groupId: string,
  userId: string,
  event: {
    _id: string;
    title: string;
    slug: string;
    startLocal: string;
  },
) {
  await Groups.updateAsync(groupId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "eventInserted",
        data: { createdBy: userId, ...event },
      },
    },
  });
}

export async function afterEventUpdate(
  groupId: string,
  userId: string,
  event: {
    _id: string;
    title: string;
    slug: string;
    startLocal: string;
    replicasUpdated: boolean;
  },
) {
  await Groups.updateAsync(groupId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "eventUpdated",
        data: { updatedBy: userId, ...event },
      },
    },
  });
}

export async function afterEventRemove(
  groupId: string,
  userId: string,
  event: {
    title: string;
    startLocal: string;
  },
) {
  await Groups.updateAsync(groupId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "eventRemoved",
        data: { removedBy: userId, ...event },
      },
    },
  });
}

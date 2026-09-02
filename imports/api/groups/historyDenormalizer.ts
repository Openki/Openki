import { Groups } from "./groups";

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

export async function afterSubscribe(groupId: string, userId: string, roleId: string) {
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

export async function afterUnsubscribe(groupId: string, userId: string, roleId: string) {
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

import { Courses } from "./courses";

export async function afterUpdate(courseId: string, userId: string) {
  await Courses.updateAsync(courseId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "updated",
        data: { updatedBy: userId },
      },
    },
  });
}

export async function afterUpdateImage(courseId: string, userId: string) {
  await Courses.updateAsync(courseId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "updated",
        data: { updatedBy: userId },
      },
    },
  });
}

export async function afterDeleteImage(courseId: string, userId: string) {
  await Courses.updateAsync(courseId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "updated",
        data: { updatedBy: userId },
      },
    },
  });
}

export async function afterSubscribe(courseId: string, userId: string, roleType: string) {
  await Courses.updateAsync(courseId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "userSubscribed",
        data: { user: userId, role: roleType },
      },
    },
  });
}

export async function afterUnsubscribe(courseId: string, userId: string, roleType: string) {
  await Courses.updateAsync(courseId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "userUnsubscribed",
        data: { user: userId, role: roleType },
      },
    },
  });
}

export async function afterGroupPromoteUpdate(
  courseId: string,
  groupId: string,
  enable: boolean,
  userId: string,
) {
  await Courses.updateAsync(courseId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "groupPromote",
        data: { user: userId, group: groupId, enable },
      },
    },
  });
}
export async function afterGroupOrgaUpdate(
  courseId: string,
  groupId: string,
  enable: boolean,
  userId: string,
) {
  await Courses.updateAsync(courseId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "groupOrga",
        data: { user: userId, group: groupId, enable },
      },
    },
  });
}

export async function afterEventInsert(
  courseId: string,
  userId: string,
  event: {
    _id: string;
    title: string;
    slug: string;
    startLocal: string;
  },
) {
  await Courses.updateAsync(courseId, {
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
  courseId: string,
  userId: string,
  event: {
    _id: string;
    title: string;
    slug: string;
    startLocal: string;
    replicasUpdated: boolean;
  },
) {
  await Courses.updateAsync(courseId, {
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
  courseId: string,
  userId: string,
  event: {
    title: string;
    startLocal: string;
  },
) {
  await Courses.updateAsync(courseId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "eventRemoved",
        data: { removedBy: userId, ...event },
      },
    },
  });
}

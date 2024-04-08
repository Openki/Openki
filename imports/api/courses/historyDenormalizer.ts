import { Courses } from "./courses";

export function afterUpdate(courseId: string, userId: string) {
  Courses.update(courseId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "updated",
        data: { updatedBy: userId },
      },
    },
  });
}

export function afterUpdateImage(courseId: string, userId: string) {
  Courses.update(courseId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "updated",
        data: { updatedBy: userId },
      },
    },
  });
}

export function afterDeleteImage(courseId: string, userId: string) {
  Courses.update(courseId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "updated",
        data: { updatedBy: userId },
      },
    },
  });
}

export function afterSubscribe(courseId: string, userId: string, roleType: string) {
  Courses.update(courseId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "userSubscribed",
        data: { user: userId, role: roleType },
      },
    },
  });
}

export function afterUnsubscribe(courseId: string, userId: string, roleType: string) {
  Courses.update(courseId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "userUnsubscribed",
        data: { user: userId, role: roleType },
      },
    },
  });
}

export function afterGroupPromoteUpdate(
  courseId: string,
  groupId: string,
  enable: boolean,
  userId: string,
) {
  Courses.update(courseId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "groupPromote",
        data: { user: userId, group: groupId, enable },
      },
    },
  });
}
export function afterGroupOrgaUpdate(
  courseId: string,
  groupId: string,
  enable: boolean,
  userId: string,
) {
  Courses.update(courseId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "groupOrga",
        data: { user: userId, group: groupId, enable },
      },
    },
  });
}

export function afterEventInsert(
  courseId: string,
  userId: string,
  event: {
    _id: string;
    title: string;
    slug: string;
    startLocal: string;
  },
) {
  Courses.update(courseId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "eventInserted",
        data: { createdBy: userId, ...event },
      },
    },
  });
}

export function afterEventUpdate(
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
  Courses.update(courseId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "eventUpdated",
        data: { updatedBy: userId, ...event },
      },
    },
  });
}

export function afterEventRemove(
  courseId: string,
  userId: string,
  event: {
    title: string;
    startLocal: string;
  },
) {
  Courses.update(courseId, {
    $addToSet: {
      history: {
        dateTime: new Date(),
        type: "eventRemoved",
        data: { removedBy: userId, ...event },
      },
    },
  });
}

import { Match, check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { i18n } from "/imports/startup/both/i18next";
import { uniq } from "lodash";

import { Courses, Course, CourseEntity, CourseModel } from "/imports/api/courses/courses";
import { Events } from "/imports/api/events/events";
import { Groups } from "/imports/api/groups/groups";
import { Regions } from "/imports/api/regions/regions";
import { CourseDiscussions } from "/imports/api/course-discussions/course-discussions";
import { Roles } from "/imports/api/roles/roles";
import * as UpdateMethods from "/imports/utils/update-methods";
import * as historyDenormalizer from "/imports/api/courses/historyDenormalizer";
import * as timeLastEditDenormalizer from "/imports/api/courses/timeLastEditDenormalizer";
import * as nextEventDenormalizer from "/imports/api/courses/nextEventDenormalizer";
import * as eventsCategoriesDenormalizer from "/imports/api/events/categoriesDenormalizer";
import * as eventsCourseImageDenormalizer from "/imports/api/events/courseImageDenormalizer";
import { Log } from "/imports/api/log/log";
import { UserModel } from "/imports/api/users/users";
import * as groupsDenormalizer from "./groupsDenormalizer";

import { Subscribe, Unsubscribe, Message } from "./subscription";

import { Notification } from "../../startup/both/emails/notification";

import { ServerMethod } from "/imports/utils/ServerMethod";
import * as StringTools from "/imports/utils/string-tools";
import * as HtmlTools from "/imports/utils/html-tools";
import { LocalizedValuePattern } from "/imports/utils/getLocalizedValue";
import * as FileStorage from "/imports/utils/FileStorage";
import { HtmlString, StringEnum, Type } from "/imports/utils/CustomChecks";
import { GroupPromoters } from "/imports/utils/update-methods";
import { resizeImage } from "../../utils/resize-image";

export interface Method<T> {
  method: string;
  read: (params: T) => Promise<{
    validate(): void;
    permitted: (user: UserModel | undefined | null) => boolean;
    provide(
      rel: string[],
      body: {
        operatorId: string | undefined;
      },
    ): void;
    apply(): Promise<void>;
  }>;
}

function registerMethod<T>(method: Method<T>): void {
  const apply = async function (params: T) {
    const change = await method.read(params);
    try {
      change.validate();
    } catch (message) {
      throw new Meteor.Error("invalid", `Invalid change ${change}:${message}`, message);
    }

    const operator = await Meteor.userAsync();

    if (!change.permitted(operator)) {
      throw new Meteor.Error(
        "not-permitted",
        `Change not permitted: ${change}`,
        `operator: ${operator?._id}`,
      );
    }

    const rel = [operator?._id as string];
    const body = { operatorId: operator?._id };
    change.provide(rel, body);
    const result = await Log.record(method.method, rel, body);
    try {
      await change.apply();
    } catch (message) {
      await result.error(message);
      throw new Meteor.Error(
        "error-applying",
        `Error applying change ${change}: ${message}`,
        message,
      );
    }
    await result.success();
  };

  Meteor.methods({ [method.method]: apply });
}

async function loadCourse(courseId: string) {
  // new!
  if (courseId === "") {
    return new Course() as CourseModel;
  }

  const course = await Courses.findOneAsync({ _id: courseId });
  if (!course) {
    throw new Meteor.Error(404, "Course not found");
  }
  return course;
}

async function loadDisabledRoles(groupIds: string[]) {
  const groups = await Promise.all(
    uniq(groupIds).map(async (groupId) => {
      const group = await Groups.findOneAsync(groupId);
      if (!group) {
        throw new Meteor.Error(404, `no group with id ${groupId}`);
      }
      return group;
    }),
  );

  return groups.flatMap((g) => g.disableCreateRoles).filter((r) => r) as string[];
}

registerMethod(Subscribe);
registerMethod(Unsubscribe);
registerMethod(Message);

export const CustomFieldPattern = {
  name: String,
  displayText: LocalizedValuePattern,
  value: Match.OneOf(String, Boolean),
  visibleFor: StringEnum("all", "editors"),
};
export type CustomField = Type<typeof CustomFieldPattern>;

export const SaveFieldPattern = {
  description: Match.Optional(HtmlString()),
  categories: Match.Optional([String]),
  name: Match.Optional(String),
  region: Match.Optional(String),
  customFields: Match.Optional([CustomFieldPattern]),
  roles: Match.Optional(Match.ObjectIncluding<Record<string, boolean>>({})),
  subs: Match.Optional([String]),
  unsubs: Match.Optional([String]),
  groups: Match.Optional([String]),
  internal: Match.Optional(Boolean),
  singleEvent: Match.Optional(Boolean),
};
export type SaveFields = Type<typeof SaveFieldPattern>;

export const save = ServerMethod("course.save", async (courseId: string, changes: SaveFields) => {
  check(courseId, String);
  check(changes, SaveFieldPattern);

  const user = await Meteor.userAsync();
  if (!user) {
    throw new Meteor.Error(401, "please log in");
  }

  const course = await loadCourse(courseId);

  if (!course.editableBy(user)) {
    throw new Meteor.Error(401, "edit not permitted");
  }

  /* Changes we want to perform */
  const set = {} as Mongo.OptionalId<CourseEntity>;

  const disabledRoles = await loadDisabledRoles(changes.groups || []);

  if (changes.roles) {
    await Promise.all(
      Roles.map(async (role) => {
        const { type } = role;

        if (course.isNew()) {
          const shouldHave =
            !!(role.preset || changes.roles?.[type]) && !disabledRoles.includes(type);

          if (shouldHave) {
            set.roles = set.roles || [];
            set.roles.push(type);
          }
        } else if (role.editable) {
          const shouldHave = !!changes.roles?.[type];
          const have = course.roles.includes(type);
          if (have && !shouldHave) {
            await Courses.updateAsync({ _id: courseId }, { $pull: { roles: type } });

            // HACK
            // due to a mongo limitation we can't { $pull { 'members.roles': type } }
            // so we keep removing one by one until there are none left
            while (
              await Courses.updateAsync(
                { _id: courseId, "members.roles": type },
                { $pull: { "members.$.roles": type } },
              )
            );
          }
          if (!have && shouldHave) {
            await Courses.updateAsync({ _id: courseId }, { $addToSet: { roles: type } });
          }
        }
      }),
    );
  }

  if (changes.description) {
    set.description = HtmlTools.sanitizeHtml(changes.description);
  }

  if (changes.categories) {
    set.categories = changes.categories.slice(0, 20);
  }
  if (changes.name) {
    set.name = StringTools.sanitizeSingleline(changes.name, 1000);
    set.slug = StringTools.slug(set.name);
  }
  if (changes.customFields) {
    set.customFields = changes.customFields.map((i) => ({
      name: i.name.substring(0, 50),
      displayText: i.displayText,
      value: typeof i.value === "string" ? i.value.substring(0, 2000) : i.value,
      visibleFor: i.visibleFor,
    }));
  }
  if (changes.internal !== undefined) {
    set.internal = changes.internal;
  }

  if (changes.singleEvent !== undefined) {
    set.singleEvent = changes.singleEvent;
  }

  if (course.isNew()) {
    // You can add newly created courses to any group
    let groups = changes.groups || [];
    groups = uniq(groups);
    groups = await Promise.all(
      groups.map(async (groupId) => {
        const group = await Groups.findOneAsync(groupId);
        if (!group) {
          throw new Meteor.Error(404, `no group with id ${groupId}`);
        }
        return group._id;
      }),
    );
    set.groups = groups;
    set.groupOrganizers = groups;

    /* region cannot be changed */
    if (!changes.region) {
      throw new Meteor.Error(404, "region missing");
    }
    const region = await Regions.findOneAsync({ _id: changes.region });
    if (!region) {
      throw new Meteor.Error(404, "region missing");
    }
    set.region = region._id;

    /* When a course is created, the creator is automatically added as sole member of the team */
    set.members = [
      {
        user: user._id,
        roles: ["participant", "team"].filter((r) => !disabledRoles.includes(r)),
        comment: i18n("courses.creator.defaultMessage", "(has proposed this course)", {
          lng: user.locale,
        }),
      },
    ];
    set.archived = false;
    set.createdby = user._id;
    set.time_created = new Date();
    const enrichedSet = timeLastEditDenormalizer.beforeInsert(set);

    courseId = await Courses.insertAsync(enrichedSet);

    await Notification.Course.record(courseId);

    if (set.groupOrganizers.length > 0) {
      await Notification["Group.Course"].record(courseId);
    }

    // Init calculated fields
    await nextEventDenormalizer.updateNextEvent(courseId);
    await groupsDenormalizer.updateGroups(courseId);
  } else {
    const enrichedSet = timeLastEditDenormalizer.beforeUpdate(set);
    await Courses.updateAsync({ _id: courseId }, { $set: enrichedSet });

    await historyDenormalizer.afterUpdate(courseId, user._id);
    if (changes.categories) {
      // if categories are update, update those from the event
      await eventsCategoriesDenormalizer.afterCourseUpdateCategories({
        _id: courseId,
        categories: changes.categories,
      });
    }
  }

  if (changes.subs) {
    const changedCourse = await Courses.findOneAsync(courseId);
    await Promise.all(
      changes.subs.map(async (role) => {
        const change = new Subscribe(changedCourse, user._id, role, "interested");
        if (change.validFor(user)) {
          await change.apply();
        }
      }),
    );
  }
  if (changes.unsubs) {
    const changedCourse = await Courses.findOneAsync(courseId);
    await Promise.all(
      changes.unsubs.map(async (role) => {
        const change = new Unsubscribe(changedCourse, user._id, role);
        if (change.validFor(user)) {
          await change.apply();
        }
      }),
    );
  }

  return courseId;
});

export const updateImage = ServerMethod(
  "course.update.image",
  async (courseId: string, file: FileStorage.UploadFile) => {
    check(courseId, String);
    check(file, FileStorage.UploadFilePattern);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(401, "please log-in");
    }

    // Load group from DB
    const course = await loadCourse(courseId);

    if (course.isNew() || !course.editableBy(user)) {
      throw new Meteor.Error(401, "Denied");
    }

    if (!Meteor.isServer) {
      return undefined;
    }

    if (course.image && !course.image.startsWith("https://")) {
      FileStorage.remove(course.image);
    }

    if (course.compactImage && !course.compactImage.startsWith("https://")) {
      FileStorage.remove(course.compactImage);
    }

    // Note: image scaling also happens on the client
    const resizedCompactImage = await resizeImage(file.content, 500);
    const compactResult = await FileStorage.upload("courses/image/compact", {
      content: resizedCompactImage,
      mimeType: file.mimeType,
    });
    const resizedDetailsImage = await resizeImage(file.content, 2000, 5000);
    const detailsResult = await FileStorage.upload("courses/image/details", {
      content: resizedDetailsImage,
      mimeType: file.mimeType,
    });

    const update = {
      compactImage: compactResult.fullFileName,
      image: detailsResult.fullFileName,
    };

    const enrichedSet = timeLastEditDenormalizer.beforeUpdateImage(update);
    await Courses.updateAsync(course._id, { $set: enrichedSet });
    await historyDenormalizer.afterUpdateImage(courseId, user._id);
    await eventsCourseImageDenormalizer.afterCourseUpdateImage(courseId, enrichedSet);

    return courseId;
  },
  { simulation: false },
);

export const deleteImage = ServerMethod(
  "course.delete.image",
  async (courseId: string) => {
    check(courseId, String);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(401, "please log-in");
    }

    // Load group from DB
    const course = await loadCourse(courseId);

    if (course.isNew() || !course.editableBy(user)) {
      throw new Meteor.Error(401, "Denied");
    }

    if (course.image && !course.image.startsWith("https://")) {
      FileStorage.remove(course.image);
    }

    if (course.compactImage && !course.compactImage.startsWith("https://")) {
      FileStorage.remove(course.compactImage);
    }

    const update = { image: "", compactImage: "" };

    const set = timeLastEditDenormalizer.beforeDeleteImage();
    await Courses.updateAsync(course._id, {
      $unset: update,
      $set: set,
    } as Mongo.Modifier<CourseEntity>);
    await historyDenormalizer.afterDeleteImage(courseId, user._id);
    await eventsCourseImageDenormalizer.afterCourseDeleteImage(courseId);

    return courseId;
  },
  { simulation: false },
);

/**
 * Add or remove a group from the groups list
 * @param courseId The course to update
 * @param groupId The group to add or remove
 * @param add Whether to add or remove the group
 *
 */
export const promote = ServerMethod(
  "course.promote",
  async (courseId: string, groupId: string, enable: boolean) => {
    await UpdateMethods.promote(Courses as unknown as GroupPromoters)(courseId, groupId, enable);
    await groupsDenormalizer.updateGroups(courseId);
    await historyDenormalizer.afterGroupPromoteUpdate(
      courseId,
      groupId,
      enable,
      Meteor.userId() as string,
    );
  },
);

/**
 * Add or remove a group from the groupOrganizers list
 * @param courseId The course to update
 * @param groupId The group to add or remove
 * @param add Whether to add or remove the group
 *
 */
export const editing = ServerMethod(
  "course.editing",
  async (courseId: string, groupId: string, enable: boolean) => {
    await UpdateMethods.editing(Courses as unknown as GroupPromoters)(courseId, groupId, enable);
    await groupsDenormalizer.updateGroups(courseId);
    await historyDenormalizer.afterGroupOrgaUpdate(
      courseId,
      groupId,
      enable,
      Meteor.userId() as string,
    );
  },
);

export const archive = ServerMethod("course.archive", async (courseId: string) => {
  check(courseId, String);

  const course = await Courses.findOneAsync({ _id: courseId });
  if (!course) {
    throw new Meteor.Error(404, "no such course");
  }
  if (!course.editableBy(await Meteor.userAsync())) {
    throw new Meteor.Error(401, "edit not permitted");
  }
  await Courses.updateAsync(course._id, { $set: { archived: true } });
});

export const unarchive = ServerMethod("course.unarchive", async (courseId: string) => {
  check(courseId, String);

  const course = await Courses.findOneAsync({ _id: courseId });
  if (!course) {
    throw new Meteor.Error(404, "no such course");
  }
  if (!course.editableBy(await Meteor.userAsync())) {
    throw new Meteor.Error(401, "edit not permitted");
  }
  await Courses.updateAsync(course._id, { $set: { archived: false } });
});

export const remove = ServerMethod("course.remove", async (courseId: string) => {
  check(courseId, String);

  const course = await Courses.findOneAsync({ _id: courseId });
  if (!course) {
    throw new Meteor.Error(404, "no such course");
  }
  if (!course.editableBy(await Meteor.userAsync())) {
    throw new Meteor.Error(401, "edit not permitted");
  }
  await Events.removeAsync({ courseId });
  await CourseDiscussions.removeAsync({ courseId });
  await Courses.removeAsync(courseId);
});

import { Match, check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { i18n } from "/imports/startup/both/i18next";
import { uniq } from "lodash-es";

import { Groups, Group, GroupEntity, GroupModel } from "./groups";
import { Events } from "/imports/api/events/events";
import { Organizations } from "../organizations/organizations";
import { Regions } from "/imports/api/regions/regions";
import { GroupDiscussions } from "../group-discussions/group-discussions";
import * as UpdateMethods from "/imports/utils/update-methods";
import * as interestedDenormalizer from "./interestedDenormalizer";
import * as historyDenormalizer from "./historyDenormalizer";
import * as timeLastEditDenormalizer from "./timeLastEditDenormalizer";
import * as nextEventDenormalizer from "./nextEventDenormalizer";
import * as eventsCategoriesDenormalizer from "/imports/api/events/categoriesDenormalizer";
import * as eventsGroupImageDenormalizer from "../events/groupImageDenormalizer";
import { Log } from "/imports/api/log/log";
import { UserModel } from "/imports/api/users/users";
import * as editorsDenormalizer from "./editorsDenormalizer";

import { Subscribe, Unsubscribe, Message } from "./subscription";

import { Notification } from "../../startup/both/emails/notification";

import { ServerMethod } from "/imports/utils/ServerMethod";
import * as StringTools from "/imports/utils/string-tools";
import * as HtmlTools from "/imports/utils/html-tools";
import { LocalizedValuePattern } from "/imports/utils/getLocalizedValue";
import * as FileStorage from "/imports/utils/FileStorage";
import { HtmlString, NotEmptyString, StringEnum, Type } from "/imports/utils/CustomChecks";
import { OrganizationPromoters } from "/imports/utils/update-methods";
import { resizeImage } from "../../utils/resize-image";
import { loadRoles } from "/imports/api/regions/loadRoles";
import { ValidationError } from "meteor/mdg:validation-error";

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

async function loadGroup(id: string) {
  const group = await Groups.findOneAsync({ _id: id });
  if (!group) {
    throw new Meteor.Error(404, "group not found");
  }
  return group;
}

async function loadDisabledRoles(organizationIds: string[]) {
  const organizations = await Promise.all(
    uniq(organizationIds).map(async (organizationId) => {
      const organization = await Organizations.findOneAsync(organizationId);
      if (!organization) {
        throw new Meteor.Error(404, `no organization with id ${organizationId}`);
      }
      return organization;
    }),
  );

  return organizations.flatMap((o) => o.disableCreateRoles).filter((r) => r) as string[];
}

registerMethod(Subscribe);
registerMethod(Unsubscribe);
registerMethod(Message);

export const CustomFieldPattern = {
  name: String,
  displayText: LocalizedValuePattern,
  value: Match.OneOf(String, Boolean),
  displayValue: Match.Optional(LocalizedValuePattern),
  visibleFor: StringEnum("all", "editors"),
};
export type CustomField = Type<typeof CustomFieldPattern>;

export const UpdateFieldsPattern = {
  name: Match.Optional(String),
  description: Match.Optional(HtmlString()),
  categories: Match.Optional([String]),
  customFields: Match.Optional([CustomFieldPattern]),
  roles: Match.Optional(Match.ObjectIncluding<Record<string, boolean>>({})),
  subs: Match.Optional([String]),
  unsubs: Match.Optional([String]),
  organizations: Match.Optional([String]),
  internal: Match.Optional(Boolean),
  singleEvent: Match.Optional(Boolean),
};
export type UpdateFields = Type<typeof UpdateFieldsPattern>;

export const CreateFieldsPattern = {
  ...UpdateFieldsPattern,
  name: NotEmptyString(),
  region: NotEmptyString(),
};
export type CreateFields = Type<typeof CreateFieldsPattern>;

/** currently needed because the save method makes currently both create and update */
export type SaveFields = Partial<CreateFields> & UpdateFields;

export const save = ServerMethod("group.save", async (groupId: string, changes: SaveFields) => {
  check(groupId, String);

  const isNew = groupId === "";

  const expectedFields = isNew ? CreateFieldsPattern : UpdateFieldsPattern;
  check(changes, expectedFields);

  const user = await Meteor.userAsync();
  if (!user) {
    throw new Meteor.Error(401, "please log in");
  }

  let group;
  if (isNew) {
    group = new Group() as GroupModel;
  } else {
    group = await loadGroup(groupId);

    if (!group.editableBy(user)) {
      throw new Meteor.Error(401, "edit not permitted");
    }
  }

  /* Changes we want to perform */
  const set = {} as Mongo.OptionalId<GroupEntity>;

  const disabledRoles = await loadDisabledRoles(changes.organizations || []);

  if (changes.roles) {
    // on creation the changes.region is set; on change group.region is set
    const roles = await loadRoles((group.region || changes.region) as string);

    await Promise.all(
      roles.map(async (role) => {
        const { id } = role;

        if (isNew) {
          const shouldHave = !!(role.preset || changes.roles?.[id]) && !disabledRoles.includes(id);

          if (shouldHave) {
            set.roles = set.roles || [];
            set.roles.push(id);
          }
        } else if (role.editable) {
          const shouldHave = !!changes.roles?.[id];
          const have = group.roles.includes(id);
          if (have && !shouldHave) {
            await Groups.updateAsync({ _id: groupId }, { $pull: { roles: id } });

            // HACK
            // due to a mongo limitation we can't { $pull { 'members.roles': type } }
            // so we keep removing one by one until there are none left
            while (
              await Groups.updateAsync(
                { _id: groupId, "members.roles": id },
                { $pull: { "members.$.roles": id } },
              )
            );
          }
          if (!have && shouldHave) {
            await Groups.updateAsync({ _id: groupId }, { $addToSet: { roles: id } });
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
    set.customFields = changes.customFields.map((i) => {
      const result = {
        name: i.name.substring(0, 50),
        displayText: i.displayText,
        value: typeof i.value === "string" ? i.value.substring(0, 2000) : i.value,
        visibleFor: i.visibleFor,
      };

      if (!i.displayValue) {
        return result;
      }

      return { ...result, displayValue: i.displayValue };
    });
  }
  if (changes.internal !== undefined) {
    set.internal = changes.internal;
  }

  if (changes.singleEvent !== undefined) {
    set.singleEvent = changes.singleEvent;
  }

  if (isNew) {
    // You can add newly created groups to any organization
    let organizations = changes.organizations || [];
    organizations = uniq(organizations);
    organizations = await Promise.all(
      organizations.map(async (organizationId) => {
        const organization = await Organizations.findOneAsync(organizationId);
        if (!organization) {
          throw new Meteor.Error(404, `no organization with id ${organizationId}`);
        }
        return organization._id;
      }),
    );
    set.organizations = organizations;
    set.teamOrganizations = organizations;

    /* region cannot be changed */
    if (!changes.region) {
      throw new Meteor.Error(404, "region missing");
    }
    const region = await Regions.findOneAsync({ _id: changes.region });
    if (!region) {
      throw new Meteor.Error(404, "region missing");
    }
    set.region = region._id;

    /* When a group is created, the creator is automatically added as sole member of the team */
    set.members = [
      {
        user: user._id,
        roles: ["participant", "team"].filter((r) => !disabledRoles.includes(r)),
        customRoles: [],
        comment: i18n("groups.creator.defaultMessage", "(has proposed this group)", {
          lng: user.locale,
        }),
      },
    ];
    set.archived = false;
    set.createdby = user._id;
    set.time_created = new Date();
    const enrichedSet = timeLastEditDenormalizer.beforeInsert(set);

    groupId = await Groups.insertAsync(enrichedSet);

    await Notification.Group.record(groupId);

    if (set.teamOrganizations.length > 0) {
      await Notification["Organization.Group"].record(groupId);
    }

    // Init calculated fields
    await nextEventDenormalizer.updateNextEvent(groupId);
    await editorsDenormalizer.updateEditors(groupId);
  } else {
    const enrichedSet = timeLastEditDenormalizer.beforeUpdate(set);
    await Groups.updateAsync({ _id: groupId }, { $set: enrichedSet });

    await historyDenormalizer.afterUpdate(groupId, user._id);
    if (changes.categories) {
      // if categories are update, update those from the event
      await eventsCategoriesDenormalizer.afterGroupUpdateCategories({
        _id: groupId,
        categories: changes.categories,
      });
    }
  }

  if (changes.subs) {
    const changedGroup = await Groups.findOneAsync(groupId);
    if (!changedGroup) {
      throw new Error("changedGroup is not defined");
    }

    const roles = await loadRoles(changedGroup.region);

    await Promise.all(
      changes.subs.map(async (role) => {
        const change = new Subscribe(
          changedGroup,
          roles.map((r) => r.id),
          user._id,
          role,
          "interested",
        );
        if (change.validFor(user)) {
          await change.apply();
        }
      }),
    );
  }
  if (changes.unsubs) {
    const changedGroup = await Groups.findOneAsync(groupId);
    await Promise.all(
      changes.unsubs.map(async (role) => {
        const change = new Unsubscribe(changedGroup, user._id, role);
        if (change.validFor(user)) {
          await change.apply();
        }
      }),
    );
  }

  return groupId;
});

export const updateImage = ServerMethod(
  "group.update.image",
  async (groupId: string, file: FileStorage.UploadFile) => {
    check(groupId, NotEmptyString());
    check(file, FileStorage.UploadFilePattern);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(401, "please log-in");
    }

    const group = await loadGroup(groupId);

    if (!group.editableBy(user)) {
      throw new Meteor.Error(401, "Denied");
    }

    if (!Meteor.isServer) {
      return undefined;
    }

    if (group.image && !group.image.startsWith("https://")) {
      FileStorage.remove(group.image);
    }

    if (group.compactImage && !group.compactImage.startsWith("https://")) {
      FileStorage.remove(group.compactImage);
    }

    // Note: image scaling also happens on the client
    const resizedCompactImage = await resizeImage(file, 500);
    const compactResult = await FileStorage.upload("groups/image/compact", resizedCompactImage);
    const resizedDetailsImage = await resizeImage(file, 2000, 5000);
    const detailsResult = await FileStorage.upload("groups/image/details", resizedDetailsImage);

    const update = {
      compactImage: compactResult.fullFileName,
      image: detailsResult.fullFileName,
    };

    const enrichedSet = timeLastEditDenormalizer.beforeUpdateImage(update);
    await Groups.updateAsync(group._id, { $set: enrichedSet });
    await historyDenormalizer.afterUpdateImage(groupId, user._id);
    await eventsGroupImageDenormalizer.afterGroupUpdateImage(groupId, enrichedSet);

    return groupId;
  },
  { simulation: false },
);

export const deleteImage = ServerMethod(
  "group.delete.image",
  async (groupId: string) => {
    check(groupId, NotEmptyString());

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(401, "please log-in");
    }

    const group = await loadGroup(groupId);

    if (!group.editableBy(user)) {
      throw new Meteor.Error(401, "Denied");
    }

    if (group.image && !group.image.startsWith("https://")) {
      FileStorage.remove(group.image);
    }

    if (group.compactImage && !group.compactImage.startsWith("https://")) {
      FileStorage.remove(group.compactImage);
    }

    const update = { image: "", compactImage: "" };

    const set = timeLastEditDenormalizer.beforeDeleteImage();
    await Groups.updateAsync(group._id, {
      $unset: update,
      $set: set,
    } as Mongo.Modifier<GroupEntity>);
    await historyDenormalizer.afterDeleteImage(groupId, user._id);
    await eventsGroupImageDenormalizer.afterGroupDeleteImage(groupId);

    return groupId;
  },
  { simulation: false },
);

/**
 * Add or remove a organization from the organizations list
 * @param groupId The group to update
 * @param organizationId The organization to add or remove
 * @param add Whether to add or remove the organization
 *
 */
export const promote = ServerMethod(
  "group.promote",
  async (groupId: string, organizationId: string, enable: boolean) => {
    await UpdateMethods.promote(Groups as unknown as OrganizationPromoters)(
      groupId,
      organizationId,
      enable,
    );
    await editorsDenormalizer.updateEditors(groupId);
    await historyDenormalizer.afterOrganizationPromoteUpdate(
      groupId,
      organizationId,
      enable,
      Meteor.userId() as string,
    );
  },
);

/**
 * Add or remove a organization from the teamOrganizations list
 * @param groupId The group to update
 * @param organizationId The organization to add or remove
 * @param add Whether to add or remove the organization
 *
 */
export const editing = ServerMethod(
  "group.editing",
  async (groupId: string, organizationId: string, enable: boolean) => {
    await UpdateMethods.editing(Groups as unknown as OrganizationPromoters)(
      groupId,
      organizationId,
      enable,
    );
    await editorsDenormalizer.updateEditors(groupId);
    await historyDenormalizer.afterOrganizationTeamUpdate(
      groupId,
      organizationId,
      enable,
      Meteor.userId() as string,
    );
  },
);

export const subscribeToCustomRole = ServerMethod(
  "group.subscribeToCustomRole",

  async (groupId: string, roleId: string, comment?: string | undefined) => {
    check(groupId, String);
    check(roleId, String);
    check(comment, Match.Optional(String));

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(401, "please log in");
    }

    const group = await loadGroup(groupId);

    const role = group.customRoles?.find((r) => r.id === roleId);

    if (!role) {
      throw new ValidationError([], `No role ${roleId}`);
    }

    // Do not allow subscribing when already subscribed
    if (group.userHasCustomRole(user._id, roleId)) {
      throw new ValidationError([], `Already subscribed as ${role.label}`);
    }

    // Add the user as member if she's not listed yet
    await Groups.updateAsync(
      { _id: group._id, "members.user": { $ne: user._id } },
      { $addToSet: { members: { user: user._id, roles: [], customRoles: [] } } },
    );

    // Now that we're sure she's listed, add the role too
    await Groups.updateAsync(
      { _id: group._id, "members.user": user._id },
      { $addToSet: { "members.$.customRoles": role.id } },
    );

    if (comment) {
      await Groups.updateAsync(
        { _id: group._id, "members.user": user._id },
        { $set: { "members.$.comment": comment } },
      );
    }

    // Update member related calculated fields
    await interestedDenormalizer.afterSubscribeToCustomRole(group._id);
    await timeLastEditDenormalizer.afterSubscribeToCustomRole(group._id);
    await historyDenormalizer.afterSubscribeToCustomRole(group._id, user._id, role.label);

    // Send notification to team

    //await Notification.Join.record(group._id, user._id, role.id, comment);
  },
);
export const unsubscribeFromCustomRole = ServerMethod(
  "group.unsubscribeFromCustomRole",

  async (groupId: string, roleId: string) => {
    check(groupId, String);
    check(roleId, String);

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "please log in");
    }

    const group = await loadGroup(groupId);

    const role = group.customRoles?.find((r) => r.id === roleId);

    if (!role) {
      throw new ValidationError([], `No role ${roleId}`);
    }

    // Do not allow unsubscribing when not subscribed
    const userHasRole = group.userHasCustomRole(userId, roleId);
    if (!userHasRole) {
      throw new ValidationError([], `not subscribed with role ${role.label}`);
    }

    await Groups.updateAsync(
      { _id: group._id, "members.user": userId },
      { $pull: { "members.$.customRoles": roleId } },
    );

    // Housekeeping: Remove members that have no role left
    await Groups.updateAsync(
      { _id: group._id },
      {
        $pull: {
          members: {
            roles: { $size: 0 },
            $or: [{ customRoles: { $exists: false } }, { customRoles: { $size: 0 } }],
          } as any, // typescript don't know $or
        },
      },
    );

    // Update member related calculated fields
    await interestedDenormalizer.afterUnsubscribeFromCustomRole(group._id);
    await timeLastEditDenormalizer.afterUnsubscribeFromCustomRole(group._id);
    await historyDenormalizer.afterUnsubscribeFromCustomRole(group._id, userId, role.label);
  },
);

export const archive = ServerMethod("group.archive", async (groupId: string) => {
  check(groupId, NotEmptyString());

  const group = await loadGroup(groupId);
  if (!group.editableBy(await Meteor.userAsync())) {
    throw new Meteor.Error(401, "edit not permitted");
  }
  await Groups.updateAsync(group._id, { $set: { archived: true } });
});

export const unarchive = ServerMethod("group.unarchive", async (groupId: string) => {
  check(groupId, NotEmptyString());

  const group = await loadGroup(groupId);
  if (!group.editableBy(await Meteor.userAsync())) {
    throw new Meteor.Error(401, "edit not permitted");
  }
  await Groups.updateAsync(group._id, { $set: { archived: false } });
});

export const remove = ServerMethod("group.remove", async (groupId: string) => {
  check(groupId, NotEmptyString());

  const group = await loadGroup(groupId);
  if (!group.editableBy(await Meteor.userAsync())) {
    throw new Meteor.Error(401, "edit not permitted");
  }
  await Events.removeAsync({ groupId });
  await GroupDiscussions.removeAsync({ groupId });
  await Groups.removeAsync(groupId);
});

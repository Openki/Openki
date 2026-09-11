import { Match, check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { i18n } from "/imports/startup/both/i18next";
import { differenceWith, uniq, uniqBy } from "lodash-es";
import { Random } from "meteor/random";

import { Groups, Group, GroupEntity, GroupModel, GroupRolePattern, GroupRole } from "./groups";
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
import * as editorsDenormalizer from "./editorsDenormalizer";

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
import { sameRole, isTeam } from "/imports/api/groups/lib/isRole";
import { canAddToTeam, canRemoveFromTeam, canSubscribeToTeam } from "./lib/teamPermissions";
import { predefinedRole, Role, RoleType, SystemRoles } from "/imports/api/groups/lib/Role";
import { RolePattern } from "./lib/RolePattern";

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
  roles: Match.Optional([GroupRolePattern]),
  organizations: Match.Optional([String]),
  internal: Match.Optional(Boolean),
  singleEvent: Match.Optional(Boolean),
};
export type UpdateFields = Type<typeof UpdateFieldsPattern>;

export const CreateFieldsPattern = {
  ...UpdateFieldsPattern,
  name: NotEmptyString(),
  region: NotEmptyString(),
  /**
   * Role subscriptions from the current user on create, currently only predefined
   * roles are supported.
   */
  subs: Match.Optional([String]),
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

  const changedRoles = changes.roles as GroupRole[];
  if (changedRoles) {
    if (isNew) {
      const regionRoles = await loadRoles(changes.region as string);
      const disabledRoles = await loadDisabledRoles(changes.organizations || []);
      const notDisabledRoles = regionRoles.filter(
        (regionRole) => !disabledRoles.includes(regionRole.id),
      );

      const groupRoles: GroupRole[] = notDisabledRoles
        // add all not editable but preset predefined roles
        .filter((r) => r.preset && !r.editable)
        .map((r) => predefinedRole(r.id));

      groupRoles.push(
        ...changedRoles
          .filter((role) => {
            switch (role.type) {
              case RoleType.Predefined:
                // only allow predefined roles that are known and not disabled in a organization
                return notDisabledRoles.some((regionRole) => regionRole.id === role.id);

              case RoleType.Custom:
                // allow any custom role
                return true;

              default:
                throw new Error("Unexpected value for role.type");
            }
          })
          .map((role) => {
            switch (role.type) {
              case RoleType.Predefined:
                // no changes needed for predefined roles
                return role;

              case RoleType.Custom:
                // add a id to custom roles
                return { ...role, id: Random.id() };

              default:
                throw new Error("Unexpected value for role.type");
            }
          }),
      );

      set.roles = groupRoles;

      /* When a group is created, the creator is automatically added as sole member of the team */
      set.members = [
        {
          user: user._id,
          roles: uniqBy(
            [
              SystemRoles.Participant,
              SystemRoles.Team,
              ...(changes.subs || []).map(predefinedRole),
            ],
            (role) => role.id,
            // only allow not disabled predefined roles
          ).filter((role) => notDisabledRoles.some((regionRole) => regionRole.id === role.id)),
          comment: i18n("groups.creator.defaultMessage", "(has proposed this group)", {
            lng: user.locale,
          }),
        },
      ];
    } else {
      const regionRoles = await loadRoles(group.region);

      // handle some lost predefined roles; in the most cases this code is not needed, it is more
      // for validation or when the role settings are changed
      const groupRoles: GroupRole[] = group.roles.filter((groupRole) => {
        if (groupRole.type !== RoleType.Predefined) {
          return false;
        }

        if (changedRoles.some((role) => sameRole(role, groupRole))) {
          return false;
        }

        // if a predefined role has been removed we need a deeper look

        const regionRole = regionRoles.find((regionRole) => regionRole.id === groupRole.id);

        // keep it when it is already known in the group and
        if (!regionRole) {
          // not exists anymore in the settings
          return true;
        } else if (!regionRole.editable) {
          // or it's not allowed to be removed
          return true;
        }

        // the rest we can handle later
        return false;
      });

      // the new order is relevant
      groupRoles.push(
        ...changedRoles
          .filter((role) => {
            if (group.roles.some((groupRole) => sameRole(role, groupRole))) {
              // allow roles that are part of the group already
              return true;
            }

            switch (role.type) {
              case RoleType.Predefined:
                // allow predefined roles that are editable
                return regionRoles.some(
                  (regionRole) => regionRole.id === role.id && regionRole.editable,
                );

              case RoleType.Custom:
                // allow new custom roles
                return !role.id;

              default:
                throw new Error("Unexpected value for role.type");
            }
          })
          .map((role) => {
            switch (role.type) {
              case RoleType.Predefined:
                // no changes needed for predefined roles
                return role;

              case RoleType.Custom:
                // add an id to new custom roles
                return !role.id ? { ...role, id: Random.id() } : role;

              default:
                throw new Error("Unexpected value for role.type");
            }
          }),
      );

      set.roles = groupRoles;

      const removedRoles = differenceWith(group.roles, groupRoles, sameRole).map(
        ({ id, type }) => ({ id, type }),
      );
      if (removedRoles.length > 0) {
        await Groups.updateAsync(
          { _id: groupId },
          {
            $pull: {
              roles: { $or: removedRoles } as any,
              "members.$[].roles": { $or: removedRoles },
            },
          },
        );
      }
    }
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

export const subscribeToRole = ServerMethod(
  "group.subscribeToRole",

  async (
    groupId: string,
    role: Role,
    comment?: string | undefined,
    notifyTeam?: boolean | undefined,
  ) => {
    check(groupId, NotEmptyString());
    check(role, RolePattern);
    check(comment, Match.Optional(String));
    check(notifyTeam, Match.Optional(Boolean));

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(401, "please log in");
    }

    const group = await loadGroup(groupId);

    const groupRole = group.roles?.find((r) => r.id === role.id && r.type === role.type);

    if (!groupRole) {
      throw new ValidationError([], `No ${role.type} role ${role.id}`);
    }

    if (!isTeam(groupRole)) {
      // Do not allow subscribing when already subscribed
      if (group.userHasRole(user._id, role)) {
        switch (groupRole.type) {
          case RoleType.Predefined:
            throw new ValidationError([], `Already subscribed as ${groupRole.id} (predefined).`);
          case RoleType.Custom:
            throw new ValidationError([], `Already subscribed as ${groupRole.label} (custom).`);
          default:
            throw new Error("Unexpected value for groupRole.type");
        }
      }
    } else {
      // The team role has special restrictions
      if (!canSubscribeToTeam(group, user)) {
        throw new ValidationError([], `Cannot subscribe to team role.`);
      }
    }

    // Add the user as member if she's not listed yet
    await Groups.updateAsync(
      { _id: group._id, "members.user": { $ne: user._id } },
      { $addToSet: { members: { user: user._id, roles: [] } } },
    );

    // Now that we're sure she's listed, add the role too
    await Groups.updateAsync(
      { _id: group._id, "members.user": user._id },
      { $addToSet: { "members.$.roles": { id: groupRole.id, type: groupRole.type } } },
    );

    if (comment) {
      await Groups.updateAsync(
        { _id: group._id, "members.user": user._id },
        { $set: { "members.$.comment": comment } },
      );
    }

    // Update member related calculated fields
    await interestedDenormalizer.afterSubscribeToRole(group._id);
    await editorsDenormalizer.updateEditors(group._id);

    await timeLastEditDenormalizer.afterSubscribeToRole(group._id);
    switch (groupRole.type) {
      case RoleType.Predefined:
        await historyDenormalizer.afterSubscribeToRole(group._id, user._id, groupRole.id);
        break;
      case RoleType.Custom:
        await historyDenormalizer.afterSubscribeToCustomRole(group._id, user._id, groupRole.label);
        break;
      default:
        throw new Error("Unexpected value for groupRole.type");
    }

    if (notifyTeam) {
      // Send notification to team
      await Notification.Join.record(group._id, user._id, role, comment);
    }
  },
);
export const unsubscribeFromRole = ServerMethod(
  "group.unsubscribeFromRole",

  async (groupId: string, role: Role) => {
    check(groupId, NotEmptyString());
    check(role, RolePattern);

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "please log in");
    }

    const group = await loadGroup(groupId);

    const groupRole = group.roles?.find((r) => r.id === role.id && r.type === role.type);

    if (!groupRole) {
      throw new ValidationError([], `No ${role.type} role ${role.id}`);
    }

    // Do not allow unsubscribing when not subscribed
    const userHasRole = group.userHasRole(userId, { id: groupRole.id, type: groupRole.type });
    if (!userHasRole) {
      switch (groupRole.type) {
        case RoleType.Predefined:
          throw new ValidationError([], `Not subscribed with role ${groupRole.id} (predefined).`);
        case RoleType.Custom:
          throw new ValidationError([], `Not subscribed with role ${groupRole.label} (custom).`);
        default:
          throw new Error("Unexpected value for groupRole.type");
      }
    }

    await Groups.updateAsync(
      { _id: group._id, "members.user": userId },
      { $pull: { "members.$.roles": { id: groupRole.id, type: groupRole.type } } },
    );

    // Housekeeping: Remove members that have no role left
    await Groups.updateAsync({ _id: group._id }, { $pull: { members: { roles: { $size: 0 } } } });

    // Update member related calculated fields
    await interestedDenormalizer.afterUnsubscribeFromRole(group._id);
    await timeLastEditDenormalizer.afterUnsubscribeFromRole(group._id);
    switch (groupRole.type) {
      case RoleType.Predefined:
        await historyDenormalizer.afterUnsubscribeFromRole(group._id, userId, groupRole.id);
        break;
      case RoleType.Custom:
        await historyDenormalizer.afterUnsubscribeFromCustomRole(
          group._id,
          userId,
          groupRole.label,
        );
        break;
      default:
        throw new Error("Unexpected value for groupRole.type");
    }
  },
);

export const updateMemberMessage = ServerMethod(
  "Groups.Message",
  async (groupId: string, message: string) => {
    check(groupId, NotEmptyString());
    check(message, Match.Maybe(String));

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "please log in");
    }

    const group = await loadGroup(groupId);

    await Groups.updateAsync(
      { _id: group._id, "members.user": userId },
      { $set: { "members.$.comment": message } },
    );
  },
);

export const addMemberToTeam = ServerMethod(
  "groups.addMemberToTeam",
  async (groupId: string, userId: string) => {
    check(groupId, NotEmptyString());
    check(userId, NotEmptyString());

    const operator = await Meteor.userAsync();
    if (!operator) {
      throw new Meteor.Error(401, "please log in");
    }

    const group = await loadGroup(groupId);

    if (!canAddToTeam(operator, group, userId)) {
      throw new ValidationError([], `Cannot subscribe to team role.`);
    }

    await Groups.updateAsync(
      { _id: group._id, "members.user": userId },
      { $addToSet: { "members.$.roles": SystemRoles.Team } },
    );

    // Update member related calculated fields
    await interestedDenormalizer.afterSubscribeToRole(group._id);
    await editorsDenormalizer.updateEditors(group._id);

    await timeLastEditDenormalizer.afterSubscribeToRole(group._id);
    await historyDenormalizer.afterSubscribeToRole(group._id, operator._id, SystemRoles.Team.id);
  },
);

export const removeMemberFromTeam = ServerMethod(
  "groups.removeMemberFromTeam",
  async (groupId: string, userId: string) => {
    check(groupId, NotEmptyString());
    check(userId, NotEmptyString());

    const operator = await Meteor.userAsync();
    if (!operator) {
      throw new Meteor.Error(401, "please log in");
    }

    const group = await loadGroup(groupId);

    if (!canRemoveFromTeam(operator, group, userId)) {
      throw new ValidationError([], `Cannot unsubscribe from team role.`);
    }

    await Groups.updateAsync(
      { _id: group._id, "members.user": userId },
      { $pull: { "members.$.roles": SystemRoles.Team } },
    );

    // Housekeeping: Remove members that have no role left
    await Groups.updateAsync({ _id: group._id }, { $pull: { members: { roles: { $size: 0 } } } });

    // Update member related calculated fields
    await interestedDenormalizer.afterUnsubscribeFromRole(group._id);
    await editorsDenormalizer.updateEditors(group._id);

    await timeLastEditDenormalizer.afterUnsubscribeFromRole(group._id);
    await historyDenormalizer.afterUnsubscribeFromRole(group._id, userId, SystemRoles.Team.id);
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

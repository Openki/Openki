import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Match, check } from "meteor/check";
import { assignIn } from "lodash-es";

import { Users } from "/imports/api/users/users";
import * as timeLastEditDenormalizer from "./timeLastEditDenormalizer";
import * as courseOrganizationsDenormalizer from "../courses/organizationsDenormalizer";
import * as userOrganizationsAndBadgesDenormalizer from "../users/organizationsAndBadgesDenormalizer";
import * as userVenuesDenormalizer from "/imports/api/users/venuesDenormalizer";
import {
  Organization,
  OrganizationEntity,
  OrganizationModel,
  Organizations,
} from "./organizations";

import * as HtmlTools from "/imports/utils/html-tools";
import { ServerMethod } from "/imports/utils/ServerMethod";
import * as FileStorage from "/imports/utils/FileStorage";
import { UploadFilePattern } from "/imports/utils/FileStorage";
import { HtmlString, Type } from "/imports/utils/CustomChecks";
import { resizeImage } from "../../utils/resize-image";

async function loadOrganization(organizationId: string) {
  // new!
  if (organizationId === "") {
    return new Organization() as OrganizationModel;
  }

  const organization = await Organizations.findOneAsync({ _id: organizationId });
  if (!organization) {
    throw new Meteor.Error(404, "Organization not found");
  }
  return organization;
}

export const SaveFieldPattern = {
  short: Match.Optional(String),
  name: Match.Optional(String),
  claim: Match.Optional(String),
  description: Match.Optional(HtmlString()),
};
export type SaveFields = Type<typeof SaveFieldPattern>;

export const save = ServerMethod(
  "organization.save",
  async (organizationId: string, changes: SaveFields) => {
    check(organizationId, String);
    check(changes, SaveFieldPattern);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(401, "please log-in");
    }

    const organization = await loadOrganization(organizationId);

    if (!organization.editableBy(user)) {
      throw new Meteor.Error(401, "Denied");
    }

    let updates = {} as Mongo.OptionalId<OrganizationEntity>;

    if (organization.isNew()) {
      // Saving user is added as first member of the organization and as creater
      organization.members.push({ user: user._id, notify: true });
      updates.createdby = user._id;
      updates.time_created = new Date();
      updates = timeLastEditDenormalizer.beforeInsert(updates);
    }
    if (changes.short !== undefined) {
      let short = changes.short.trim();
      if (short.length === 0) {
        short = `${organization.name || changes.name}`;
      }
      updates.short = short.substring(0, 7);
    }
    if (changes.name !== undefined) {
      updates.name = changes.name.substring(0, 50);
    }
    if (changes.claim !== undefined) {
      updates.claim = changes.claim.substring(0, 1000);
    }
    if (changes.description !== undefined) {
      updates.description = HtmlTools.sanitizeHtml(changes.description);
    }

    // Don't update nothing
    if (Object.keys(updates).length === 0) {
      return undefined;
    }

    if (Object.values(updates).some((u) => !u)) {
      throw new Meteor.Error("The name, short, claim and description fields are mandatory.");
    }

    if (organization.isNew()) {
      organizationId = await Organizations.insertAsync(assignIn(organization, updates));
      await userOrganizationsAndBadgesDenormalizer.updateOrganizationsAndBadges(user._id);
    } else {
      updates = timeLastEditDenormalizer.beforeUpdate(updates);
      await Organizations.updateAsync(organization._id, { $set: updates });
    }

    return organizationId;
  },
);

export const updateLogo = ServerMethod(
  "organization.update.logo",
  async (organizationId: string, file: FileStorage.UploadFile) => {
    check(organizationId, String);
    check(file, UploadFilePattern);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(401, "please log-in");
    }

    const organization = await loadOrganization(organizationId);

    if (organization.isNew() || !organization.editableBy(user)) {
      throw new Meteor.Error(401, "Denied");
    }

    if (!Meteor.isServer) {
      return undefined;
    }

    if (organization.logoUrl && !organization.logoUrl.startsWith("https://")) {
      FileStorage.remove(organization.logoUrl);
    }

    // Note: image scaling also happens on the client
    const resizedImage = await resizeImage(file.content, 600);
    const result = await FileStorage.upload("organizations/logos/", {
      content: resizedImage,
      mimeType: file.mimeType,
    });

    const update = { logoUrl: result.fullFileName };

    const enrichedSet = timeLastEditDenormalizer.beforeUpdateLogo(update);
    await Organizations.updateAsync(organization._id, { $set: enrichedSet });

    return organizationId;
  },
  { simulation: false },
);

export const deleteLogo = ServerMethod(
  "organization.delete.logo",
  async (organizationId: string) => {
    check(organizationId, String);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(401, "please log-in");
    }

    const organization = await loadOrganization(organizationId);

    if (organization.isNew() || !organization.editableBy(user)) {
      throw new Meteor.Error(401, "Denied");
    }

    if (organization.logoUrl && !organization.logoUrl.startsWith("https://")) {
      FileStorage.remove(organization.logoUrl);
    }

    const update: Mongo.Modifier<OrganizationEntity> = { $unset: { logoUrl: "" } };

    const set = timeLastEditDenormalizer.beforeDeleteLogo();
    await Organizations.updateAsync(organization._id, { ...update, $set: set });

    return organizationId;
  },
  { simulation: false },
);

export const remove = ServerMethod("organization.remove", async (organizationId: string) => {
  check(organizationId, String);

  const user = await Meteor.userAsync();
  if (!user) {
    throw new Meteor.Error(401, "please log in");
  }

  const organization = await Organizations.findOneAsync(organizationId);
  if (!organization) {
    throw new Meteor.Error(404, "No such organization");
  }

  if (!organization.editableBy(user)) {
    throw new Meteor.Error(401, "not permitted");
  }

  await userVenuesDenormalizer.beforeOrganizationRemove(organization);

  await Organizations.removeAsync(organizationId);

  // Update list of organizers per course
  await courseOrganizationsDenormalizer.updateOrganizations({ groups: organizationId });
  // Update List of badges per user
  await userOrganizationsAndBadgesDenormalizer.updateOrganizationsAndBadges({ groups: groupId });
});

export const updateMembership = ServerMethod(
  "organization.updateMembership",
  async (userId: string, organizationId: string, join: boolean) => {
    check(userId, String);
    check(organizationId, String);

    const sender = await Meteor.userAsync();
    if (!sender) {
      throw new Meteor.Error(401, "please log-in");
    }

    const organization = await loadOrganization(organizationId);

    if (organization.isNew() || !organization.editableBy(sender)) {
      throw new Meteor.Error(401, "Denied");
    }

    const user = await Users.findOneAsync({ _id: userId });
    if (!user) {
      throw new Meteor.Error(404, "User not found");
    }

    let update;
    if (join) {
      update = { $addToSet: { members: { user: user._id, notify: true } } };
    } else {
      update = { $pull: { members: { user: user._id } } };
    }

    // By using the restrictive selector that checks organization membership we can
    // avoid the unlikely race condition where a user is not member anymore
    // but can still add somebody else to the organization.
    await Organizations.updateAsync(organization._id, update);

    if (join) {
      await userVenuesDenormalizer.afterOrganizationAddMember(userId, organization);
    } else {
      await userVenuesDenormalizer.afterOrganizationRemoveMember(userId, organization);
    }

    await userOrganizationsAndBadgesDenormalizer.updateOrganizationsAndBadges(user._id);
  },
);
export const toggleMemberNotify = ServerMethod(
  "organization.toggleMemberNotify",
  async (organizationId: string) => {
    check(organizationId, String);

    const sender = await Meteor.userAsync();
    if (!sender) {
      throw new Meteor.Error(401, "please log-in");
    }

    const organization = await loadOrganization(organizationId);

    if (organization.isNew()) {
      throw new Meteor.Error(401, "Denied");
    }

    const organizationMember = organization.members.find((m) => m.user === sender._id);

    if (!organizationMember) {
      throw new Meteor.Error(401, "Denied");
    }

    await Organizations.updateAsync(
      { _id: organization._id, "members.user": organizationMember.user },
      { $set: { "members.$.notify": !organizationMember.notify } },
    );
  },
);

import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";

import { NotEmptyString } from "/imports/utils/CustomChecks";

import { Organizations } from "/imports/api/organizations/organizations";
import { UserModel } from "/imports/api/users/users";

// The code to update the organizations and teamOrganizations field must do the same
// thing for Groups and Events. So we parameterize the methods
// with a collection passed as argument on construction.

export interface OrganizationPromoterEntity {
  organizations: string[];
  teamOrganizations: string[];
}

export interface OrganizationPromoterModel {
  _id: string;
  editableBy(user: UserModel): boolean;
}

export type OrganizationPromoters = Mongo.Collection<
  OrganizationPromoterEntity,
  OrganizationPromoterModel
>;

/**
 * Create an update method for the organizations field
 * @param collection The collection the changes will be applied to when the method is called
 */
export function promote(collection: OrganizationPromoters) {
  return async function (docId: string, organizationId: string, enable: boolean) {
    check(docId, NotEmptyString());
    check(organizationId, NotEmptyString());
    check(enable, Boolean);

    const doc = await collection.findOneAsync(docId);
    if (!doc) {
      throw new Meteor.Error(404, "Doc not found");
    }

    const organization = await Organizations.findOneAsync(organizationId);
    if (!organization) {
      throw new Meteor.Error(404, "Organization not found");
    }

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(401, "not permitted");
    }

    const canPromote = user.canPromoteWith(organization._id);
    const canEdit = doc.editableBy(user);

    const update: Mongo.Modifier<OrganizationPromoterEntity> = {};
    if (enable) {
      // The user is allowed to add the organization if she is part of the organization
      if (!canPromote) {
        throw new Meteor.Error(401, "not permitted");
      }
      update.$addToSet = { organizations: organization._id };
    } else {
      // The user is allowed to remove the organization if she is part of the organization
      // or if she has editing rights on the group
      if (!canPromote && !canEdit) {
        throw new Meteor.Error(401, "not permitted");
      }
      update.$pull = { organizations: organization._id, teamOrganizations: organization._id };
    }

    await collection.updateAsync(doc._id, update);
  };
}

/**
 * Create an update method for the teamOrganizations field
 * @param collection the collection the changes will be applied to when the method is called
 * @return A function that can be used as meteor method
 */
export function editing(collection: OrganizationPromoters) {
  return async function (docId: string, organizationId: string, enable: boolean) {
    check(docId, NotEmptyString());
    check(organizationId, NotEmptyString());
    check(enable, Boolean);

    const doc = await collection.findOneAsync(docId);
    if (!doc) {
      throw new Meteor.Error(404, "Doc not found");
    }

    const organization = await Organizations.findOneAsync(organizationId);
    if (!organization) {
      throw new Meteor.Error(404, "Organization not found");
    }

    const user = await Meteor.userAsync();
    if (!user || !doc.editableBy(user)) {
      throw new Meteor.Error(401, "Not permitted");
    }

    const update: Mongo.Modifier<OrganizationPromoterEntity> = {};
    const op = enable ? "$addToSet" : "$pull";
    update[op] = { teamOrganizations: organization._id };

    await collection.updateAsync(doc._id, update);
  };
}

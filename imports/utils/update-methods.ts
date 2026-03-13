import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";

import { Organizations } from "../api/organizations/organizations";
import { UserModel } from "/imports/api/users/users";

// The code to update the groups and teamOrganizations field must do the same
// thing for Courses and Events. So we parameterize the methods
// with a collection passed as argument on construction.

export interface OrganizationPromoterEntity {
  groups: string[];
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
 * Create an update method for the groups field
 * @param collection The collection the changes will be applied to when the method is called
 */
export function promote(collection: OrganizationPromoters) {
  return async function (docId: string, organizationId: string, enable: boolean) {
    check(docId, String);
    check(organizationId, String);
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

    const mayPromote = user.mayPromoteWith(organization._id);
    const mayEdit = doc.editableBy(user);

    const update: Mongo.Modifier<OrganizationPromoterEntity> = {};
    if (enable) {
      // The user is allowed to add the organization if she is part of the organization
      if (!mayPromote) {
        throw new Meteor.Error(401, "not permitted");
      }
      update.$addToSet = { groups: organization._id };
    } else {
      // The user is allowed to remove the organization if she is part of the organization
      // or if she has editing rights on the course
      if (!mayPromote && !mayEdit) {
        throw new Meteor.Error(401, "not permitted");
      }
      update.$pull = { groups: organization._id, teamOrganizations: organization._id };
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
    check(docId, String);
    check(organizationId, String);
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

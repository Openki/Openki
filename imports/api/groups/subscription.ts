import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { ValidationError } from "meteor/mdg:validation-error";

import { Groups, Group, GroupModel } from "./groups";
import * as interestedDenormalizer from "./interestedDenormalizer";
import * as historyDenormalizer from "./historyDenormalizer";
import * as timeLastEditDenormalizer from "./timeLastEditDenormalizer";
import * as Alert from "/imports/api/alerts/alert";
import { Events } from "/imports/api/events/events";
import { UserModel } from "/imports/api/users/users";
import { Method } from "./methods";
import * as editorsDenormalizer from "./editorsDenormalizer";

import { hasRole } from "./lib/hasRole";
import { Notification } from "../../startup/both/emails/notification";
import { StringEnum, Type } from "/imports/utils/CustomChecks";

export async function processChange<T>(change: Change<T>, options?: { isSimulation: boolean }) {
  try {
    if (Meteor.isClient && options?.isSimulation) {
      Meteor.call(change.constructor.method, change.dict());
    } else {
      await Meteor.callAsync(change.constructor.method, change.dict());
    }
  } catch (err) {
    console.error(err);
    Alert.serverError(err);
  }
}

const checkGroup = function (obj: unknown) {
  if (!(obj instanceof Group)) {
    throw new Meteor.Error("Match failed", "Expected group object");
  }
  return obj as GroupModel;
};

/** A change by a user
 *
 * A change can validate() itself and knows who is permitted() to apply()
 * it to the system. Changes can read() from and write() themselves to
 * dicts suitable for Mongo and JSON serialization.
 *
 * Changes are typically created on the client to find out whether a
 * user is allowed to do something. Then when the user actually does it,
 * the change is sent to the server to be applied.
 *
 */
abstract class Change<T> {
  /** See: https://stackoverflow.com/questions/33387318/access-to-static-properties-via-this-constructor-in-typescript/33404548#33404548 */
  get ["constructor"]() {
    return typeof this as unknown as Method<T>;
  }

  /**
   * Find out whether the change makes sense and could be applied
   * by the given user.
   */
  validFor(operator: UserModel | undefined | null) {
    try {
      this.validate();
    } catch (e) {
      if (e instanceof ValidationError) {
        return false;
      }
      throw e;
    }
    return this.permitted(operator);
  }

  abstract validate(): void;

  abstract permitted(operator: UserModel | undefined | null): boolean;

  abstract dict(): T;
}

export const ReasonPattern = StringEnum("interested", "rsvp");
export type Reason = Type<typeof ReasonPattern>;

export class Subscribe extends Change<{
  change: string;
  groupId: string;
  regionRoles: string[];
  userId: string | undefined;
  role: string;
  reason: Reason;
  comment?: string | undefined;
}> {
  group: GroupModel;
  regionRoles: string[];

  userId: string | undefined;

  role: string;

  reason: Reason;

  comment: string | undefined;

  static readonly method = "Groups.Subscribe";

  static async read(body: {
    groupId: string;
    regionRoles: string[];
    userId: string | undefined;
    role: string;
    reason: Reason;
    comment?: string | undefined;
  }) {
    check(body, Object);
    return new this(
      await Groups.findOneAsync(body.groupId),
      body.regionRoles,
      body.userId,
      body.role,
      body.reason,
      body.comment,
    );
  }

  constructor(
    group: GroupModel | undefined,
    regionRoles: string[],
    userId: string | undefined,
    role: string,
    reason: Reason,
    comment?: string | undefined,
  ) {
    super();

    this.group = checkGroup(group);

    check(regionRoles, [String]);
    this.regionRoles = regionRoles;

    check(userId, Match.Optional(String));
    this.userId = userId;

    check(role, String);
    this.role = role;

    check(reason, ReasonPattern);
    this.reason = reason;

    check(comment, Match.Optional(String));
    this.comment = comment;
  }

  toString() {
    return `${this.constructor.method}(${this.role})`;
  }

  validate() {
    if (!this.group.roles.includes(this.role)) {
      throw new ValidationError([], `No role ${this.role}`);
    }

    // Do not allow subscribing when already subscribed
    if (this.group.userHasRole(this.userId, this.role)) {
      throw new ValidationError([], `Already subscribed as ${this.role}`);
    }
  }

  permitted(operator: UserModel | undefined | null) {
    if (!operator) {
      return false;
    }

    // Admins can subscribe to all roles
    if (operator.hasPrivilege("admin")) {
      return true;
    }

    // The team role is restricted
    if (this.role === "team") {
      // If there are no team-members, anybody can join
      if (!hasRole(this.group.members, "team")) {
        return operator._id === this.userId;
      }

      // Only members of the team can take-on other people
      if (this.group.userHasRole(operator._id, "team")) {
        // Only participating users can be drafted
        const candidateRoles = this.regionRoles.filter((r) => r !== "team");

        // In for a penny, in for a pound
        if (candidateRoles.some((role) => this.group.userHasRole(this.userId, role))) {
          return true;
        }
      }
      return false;
    }

    // The other roles can only be chosen by the users themselves
    return operator._id === this.userId;
  }

  dict() {
    return {
      change: "subscribe",
      regionRoles: this.regionRoles,
      groupId: this.group._id,
      userId: this.userId,
      role: this.role,
      reason: this.reason,
      comment: this.comment,
    };
  }

  provide(
    rel: string[],
    body: {
      operatorId: string | undefined;
    },
  ) {
    if (!this.userId) {
      throw new Error("Unexpected falsy: this.userId");
    }
    rel.push(this.userId);
    Object.assign(body, this.dict());
  }

  async apply() {
    if (!this.userId) {
      throw new Error("Unexpected falsy: this.userId");
    }
    // Add the user as member if she's not listed yet
    // Note that the user will be created with the role already
    // filled to avoid seeing empty list of roles.
    await Groups.updateAsync(
      { _id: this.group._id, "members.user": { $ne: this.userId } },
      { $addToSet: { members: { user: this.userId, roles: [this.role] } } },
    );

    // Now that we're sure she's listed, add the role too.
    // If we just added her, this is a no-op.
    await Groups.updateAsync(
      { _id: this.group._id, "members.user": this.userId },
      { $addToSet: { "members.$.roles": this.role } },
    );

    if (this.comment) {
      await Groups.updateAsync(
        { _id: this.group._id, "members.user": this.userId },
        { $set: { "members.$.comment": this.comment } },
      );
    }

    // Update member related calculated fields
    await interestedDenormalizer.afterSubscribeToRole(this.group._id);
    await editorsDenormalizer.updateEditors(this.group._id);

    await timeLastEditDenormalizer.afterSubscribeToRole(this.group._id);
    await historyDenormalizer.afterSubscribeToRole(this.group._id, this.userId, this.role);

    if (this.reason === "interested") {
      // Send notification to team
      await Notification.Join.record(this.group._id, this.userId, this.role, this.comment);
    }
  }
}

export class Unsubscribe extends Change<{
  change: string;
  groupId: string;
  userId: string;
  role: string;
}> {
  group: GroupModel;

  userId: string;

  role: string;

  static readonly method = "Groups.Unsubscribe";

  static async read(body: { groupId: string; userId: string; role: string }) {
    return new this(await Groups.findOneAsync(body.groupId), body.userId, body.role);
  }

  constructor(group: GroupModel | undefined, userId: string | undefined | null, role: string) {
    super();

    this.group = checkGroup(group);

    check(userId, String);
    this.userId = userId;

    check(role, String);
    this.role = role;
  }

  toString() {
    return `${this.constructor.method}(${this.role})`;
  }

  validate() {
    // Do not allow unsubscribing when not subscribed
    const userHasRole = this.group.userHasRole(this.userId, this.role);
    if (!userHasRole) {
      throw new ValidationError([], `not subscribed with role ${this.role}`);
    }
  }

  permitted(operator: UserModel | undefined | null) {
    if (!operator) {
      return false;
    }

    // Admins can do anything
    if (operator.hasPrivilege("admin")) {
      return true;
    }

    // The team role is restricted
    if (this.role === "team") {
      // Members of the team can take-out other people
      // The nuclear option. We'll have to reconsider this!
      return this.group.userHasRole(operator._id, "team");
    }

    // The other roles can only be unsubscribed from by the users themselves
    return operator._id === this.userId;
  }

  dict() {
    return {
      change: "unsubscribe",
      groupId: this.group._id,
      userId: this.userId,
      role: this.role,
    };
  }

  provide(
    rel: string[],
    body: {
      operatorId: string | undefined;
    },
  ) {
    rel.push(this.userId);
    rel.push(this.group._id);
    Object.assign(body, this.dict());
  }

  async apply() {
    const update = { $pull: { "members.$.roles": this.role } } as any;
    // Unsubscribe from the team also means remove editor rights.
    if (this.role === "team") {
      update.$pull.editors = this.userId;
      await Events.updateAsync(
        { groupId: this.group._id },
        { $pull: { editors: this.userId } },
        { multi: true },
      );
    }
    await Groups.updateAsync({ _id: this.group._id, "members.user": this.userId }, update);

    // Housekeeping: Remove members that have no role left
    await Groups.updateAsync(
      { _id: this.group._id },
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
    await interestedDenormalizer.afterUnsubscribeFromRole(this.group._id);
    await editorsDenormalizer.updateEditors(this.group._id);

    await timeLastEditDenormalizer.afterUnsubscribeFromRole(this.group._id);
    await historyDenormalizer.afterUnsubscribeFromRole(this.group._id, this.userId, this.role);
  }
}

export class Message extends Change<{
  change: string;
  groupId: string;
  userId: string;
  message: string | undefined;
}> {
  group: GroupModel;

  userId: string;

  message: string | undefined;

  static readonly method = "Groups.Message";

  static async read(body: { groupId: string; userId: string; message: string | undefined }) {
    return new this(await Groups.findOneAsync(body.groupId), body.userId, body.message);
  }

  constructor(group: GroupModel | undefined, userId: string, message: string | undefined) {
    super();

    this.group = checkGroup(group);

    check(userId, String);
    this.userId = userId;

    check(message, Match.Optional(String));
    this.message = message;
  }

  toString() {
    return `${this.constructor.method}()`;
  }

  validate() {
    return true;
  }

  permitted(operator: UserModel | undefined | null) {
    if (!operator) {
      return false;
    }

    // The other roles can only be unsubscribed from by the users themselves
    return operator._id === this.userId;
  }

  dict() {
    return {
      change: "message",
      groupId: this.group._id,
      userId: this.userId,
      message: this.message,
    };
  }

  provide(
    rel: string[],
    body: {
      operatorId: string | undefined;
    },
  ) {
    rel.push(this.userId);
    rel.push(this.group._id);
    Object.assign(body, this.dict());
  }

  async apply() {
    await Groups.updateAsync(
      { _id: this.group._id, "members.user": this.userId },
      { $set: { "members.$.comment": this.message } },
    );
  }
}

import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { ValidationError } from "meteor/mdg:validation-error";

import { Courses, Course, CourseModel } from "/imports/api/courses/courses";
import * as interestedDenormalizer from "/imports/api/courses/interestedDenormalizer";
import * as historyDenormalizer from "/imports/api/courses/historyDenormalizer";
import * as timeLastEditDenormalizer from "/imports/api/courses/timeLastEditDenormalizer";
import * as Alert from "/imports/api/alerts/alert";
import { Events } from "/imports/api/events/events";
import { UserModel } from "/imports/api/users/users";
import { Method } from "/imports/api/courses/methods";
import * as groupsDenormalizer from "./groupsDenormalizer";

import { hasRole } from "/imports/utils/course-role-utils";
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
    /* eslint-disable-next-line no-console */
    console.error(err);
    Alert.serverError(err);
  }
}

const checkCourse = function (obj: unknown) {
  if (!(obj instanceof Course)) {
    throw new Meteor.Error("Match failed", "Expected Course object");
  }
  return obj as CourseModel;
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
  courseId: string;
  userId: string | undefined;
  role: string;
  reason: Reason;
  comment: string | undefined;
}> {
  course: CourseModel;

  userId: string | undefined;

  role: string;

  reason: Reason;

  comment: string | undefined;

  static get method() {
    return "Courses.Subscribe";
  }

  static async read(body: {
    courseId: string;
    userId: string | undefined;
    role: string;
    reason: Reason;
    comment?: string | undefined;
  }) {
    check(body, Object);
    return new this(
      await Courses.findOneAsync(body.courseId),
      body.userId,
      body.role,
      body.reason,
      body.comment,
    );
  }

  constructor(
    course: CourseModel | undefined,
    userId: string | undefined,
    role: string,
    reason: Reason,
    comment?: string | undefined,
  ) {
    super();

    this.course = checkCourse(course);

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
    if (!this.course.roles.includes(this.role)) {
      throw new ValidationError([], `No role ${this.role}`);
    }

    // Do not allow subscribing when already subscribed
    if (this.course.userHasRole(this.userId, this.role)) {
      throw new ValidationError([], `Already subscribed as ${this.role}`);
    }
  }

  permitted(operator: UserModel | undefined | null) {
    if (!operator) {
      return false;
    }

    // Admins may subscribe to all roles
    if (operator.privileged("admin")) {
      return true;
    }

    // The team role is restricted
    if (this.role === "team") {
      // If there are no team-members, anybody can join
      if (!hasRole(this.course.members, "team")) {
        return operator._id === this.userId;
      }

      // Only members of the team can take-on other people
      if (this.course.userHasRole(operator._id, "team")) {
        // Only participating users can be drafted
        const candidateRoles = ["participant", "mentor", "host"];

        // In for a penny, in for a pound
        if (candidateRoles.some((role) => this.course.userHasRole(this.userId, role))) {
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
      courseId: this.course._id,
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
    await Courses.updateAsync(
      { _id: this.course._id, "members.user": { $ne: this.userId } },
      { $addToSet: { members: { user: this.userId, roles: [this.role] } } },
    );

    // Now that we're sure she's listed, add the role too.
    // If we just added her, this is a no-op.
    await Courses.updateAsync(
      { _id: this.course._id, "members.user": this.userId },
      { $addToSet: { "members.$.roles": this.role } },
    );

    if (this.comment) {
      await Courses.updateAsync(
        { _id: this.course._id, "members.user": this.userId },
        { $set: { "members.$.comment": this.comment } },
      );
    }

    // Update member related calculated fields
    await interestedDenormalizer.afterSubscribe(this.course._id);
    await groupsDenormalizer.updateGroups(this.course._id);

    await timeLastEditDenormalizer.afterSubscribe(this.course._id);
    await historyDenormalizer.afterSubscribe(this.course._id, this.userId, this.role);

    if (this.reason === "interested") {
      // Send notification to team
      await Notification.Join.record(this.course._id, this.userId, this.role, this.comment);
    }
  }
}

export class Unsubscribe extends Change<{
  change: string;
  courseId: string;
  userId: string;
  role: string;
}> {
  course: CourseModel;

  userId: string;

  role: string;

  static get method() {
    return "Courses.Unsubscribe";
  }

  static async read(body: { courseId: string; userId: string; role: string }) {
    return new this(await Courses.findOneAsync(body.courseId), body.userId, body.role);
  }

  constructor(course: CourseModel | undefined, userId: string | undefined | null, role: string) {
    super();

    this.course = checkCourse(course);

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
    const userHasRole = this.course.userHasRole(this.userId, this.role);
    if (!userHasRole) {
      throw new ValidationError([], `not subscribed with role ${this.role}`);
    }
  }

  permitted(operator: UserModel | undefined | null) {
    if (!operator) {
      return false;
    }

    // Admins may do anything
    if (operator.privileged("admin")) {
      return true;
    }

    // The team role is restricted
    if (this.role === "team") {
      // Members of the team can take-out other people
      // The nuclear option. We'll have to reconsider this!
      return this.course.userHasRole(operator._id, "team");
    }

    // The other roles can only be unsubscribed from by the users themselves
    return operator._id === this.userId;
  }

  dict() {
    return {
      change: "unsubscribe",
      courseId: this.course._id,
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
    rel.push(this.course._id);
    Object.assign(body, this.dict());
  }

  async apply() {
    const update = { $pull: { "members.$.roles": this.role } } as any;
    // Unsubscribe from the team also means remove editor rights.
    if (this.role === "team") {
      update.$pull.editors = this.userId;
      await Events.updateAsync(
        { courseId: this.course._id },
        { $pull: { editors: this.userId } },
        { multi: true },
      );
    }
    await Courses.updateAsync({ _id: this.course._id, "members.user": this.userId }, update);

    // Housekeeping: Remove members that have no role left
    await Courses.updateAsync(
      { _id: this.course._id },
      {
        $pull: { members: { roles: { $size: 0 } } },
      },
    );

    // Update member related calculated fields
    await interestedDenormalizer.afterUnsubscribe(this.course._id);
    await groupsDenormalizer.updateGroups(this.course._id);

    await timeLastEditDenormalizer.afterUnsubscribe(this.course._id);
    await historyDenormalizer.afterUnsubscribe(this.course._id, this.userId, this.role);
  }
}

export class Message extends Change<{
  change: string;
  courseId: string;
  userId: string;
  message: string | undefined;
}> {
  course: CourseModel;

  userId: string;

  message: string | undefined;

  static get method() {
    return "Courses.Message";
  }

  static async read(body: { courseId: string; userId: string; message: string | undefined }) {
    return new this(await Courses.findOneAsync(body.courseId), body.userId, body.message);
  }

  constructor(course: CourseModel | undefined, userId: string, message: string | undefined) {
    super();

    this.course = checkCourse(course);

    check(userId, String);
    this.userId = userId;

    check(message, Match.Optional(String));
    this.message = message;
  }

  toString() {
    return `${this.constructor.method}()`;
  }

  /* eslint-disable-next-line class-methods-use-this */
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
      courseId: this.course._id,
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
    rel.push(this.course._id);
    Object.assign(body, this.dict());
  }

  async apply() {
    await Courses.updateAsync(
      { _id: this.course._id, "members.user": this.userId },
      { $set: { "members.$.comment": this.message } },
    );
  }
}

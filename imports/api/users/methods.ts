import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { Match, check } from "meteor/check";
import { _ } from "meteor/underscore";
import { ValidationError } from "meteor/mdg:validation-error";

import { Log } from "/imports/api/log/log";
import { Groups } from "/imports/api/groups/groups";
import { Users } from "/imports/api/users/users";
import { Course, Courses } from "/imports/api/courses/courses";
import { Events } from "/imports/api/events/events";
import * as courseInterestedDenormalizer from "/imports/api/courses/interestedDenormalizer";

import * as UserPrivilegeUtils from "/imports/utils/user-privilege-utils";
import * as HtmlTools from "/imports/utils/html-tools";
import * as Profile from "/imports/utils/profile";
import { isEmail } from "/imports/utils/email-tools";
import * as StringTools from "/imports/utils/string-tools";
import * as AsyncTools from "/imports/utils/async-tools";
import { ServerMethod } from "/imports/utils/ServerMethod";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { HtmlString, SafeString, Type, UnsafeString } from "/imports/utils/CustomChecks";
import { NotAllowedCharacter } from "/imports/startup/both/NotAllowedCharacter";

/**
 * Set user region
 */
export const regionChange = ServerMethod(
  "user.regionChange",
  async (newRegion: string) => {
    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "please log in");
    }

    await Profile.Region.change(userId, newRegion, "client call");
  },
  { simulation: false },
);

/**
 * Update user avatar color
 * @param newColor hsl hue number, otherwise a random color is generated
 */
export const updateAvatarColor = ServerMethod(
  "user.updateAvatarColor",
  async (newColor?: number) => {
    check(newColor, Match.Optional(Number));

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "please log in");
    }

    const color = newColor ?? _.random(360);
    await Profile.AvatarColor.change(userId, color);
  },
);

/**
 * Update user description
 */
export const updateDescription = ServerMethod(
  "user.updateDescription",
  async (description: UnsafeString) => {
    check(description, HtmlString());

    const userId = Meteor.userId();
    if (!userId) {
      throw new ValidationError([{ name: "description", type: "plzLogin" }], "Not logged-in");
    }

    const sane = HtmlTools.saneHtml(description, 400);

    const result = await Profile.Description.change(userId, sane);
    if (!result) {
      throw new ValidationError(
        [{ name: "description", type: "descriptionError" }],
        "Failed to update description",
      );
    }
  },
);

/**
 * Update username
 */
export const updateUsername = ServerMethod(
  "user.updateUsername",
  async (username: UnsafeString) => {
    check(username, SafeString());

    const user = await Meteor.userAsync();
    if (!user) {
      throw new ValidationError([{ name: "username", type: "plzLogin" }], "Not logged-in");
    }

    let saneUsername = StringTools.saneTitle(username);

    ((PublicSettings.contribution?.forbiddenChars || []) as string[]).forEach((c) => {
      saneUsername = saneUsername.replace(RegExp(c, "g"), "");
    });
    saneUsername = saneUsername.trim().substring(0, 200);

    if (saneUsername.length === 0) {
      throw new ValidationError(
        [{ name: "username", type: "noUserName" }],
        "username cannot be empty",
      );
    }

    if (NotAllowedCharacter.find((c) => saneUsername.includes(c))) {
      throw new ValidationError(
        [{ name: "username", type: "notAllowedCharacter" }],
        "Not allowed character",
      );
    }

    if (saneUsername === user.username) {
      return;
    }

    if (Accounts.findUserByUsername(saneUsername)) {
      throw new ValidationError(
        [{ name: "username", type: "userExists" }],
        "username is already taken",
      );
    }

    const result = await Profile.Username.change(user._id, saneUsername);
    if (!result) {
      throw new ValidationError(
        [{ name: "username", type: "nameError" }],
        "Failed to update username",
      );
    }
  },
  { simulation: false },
);

/**
 * Update automated notification flag
 */
export const updateAutomatedNotification = ServerMethod(
  "user.updateAutomatedNotification",
  async (allow: boolean) => {
    check(allow, Boolean);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new ValidationError([{ name: "notifications", type: "plzLogin" }], "Not logged-in");
    }

    if (user.notifications !== allow) {
      await Profile.Notifications.change(user._id, allow, undefined, "profile change");
    }
  },
);

/**
 * Update private messages flag
 */
export const updatePrivateMessages = ServerMethod(
  "user.updatePrivateMessages",
  async (allow: boolean) => {
    check(allow, Boolean);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new ValidationError(
        [{ name: "allowPrivateMessages", type: "plzLogin" }],
        "Not logged-in",
      );
    }

    if (user.allowPrivateMessages !== allow) {
      await Profile.PrivateMessages.change(user._id, allow, undefined, "profile change");
    }
  },
);

/**
 * Update email
 */
export const updateEmail = ServerMethod(
  "user.updateEmail",
  async (email: string) => {
    check(email, SafeString());

    const user = await Meteor.userAsync();
    if (!user) {
      throw new ValidationError([{ name: "email", type: "plzLogin" }], "Not logged-in");
    }

    const newEmail = email.trim() || false;
    const oldEmail = user.emailAddress();

    // for users with email not yet set, we dont want to force them
    // to enter a email when they change other profile settings.
    if (newEmail === oldEmail) {
      return;
    }

    if (!newEmail) {
      throw new ValidationError(
        [{ name: "email", type: "noEmail" }],
        "Please enter an e-mail address.",
      );
    }

    if (!isEmail(newEmail)) {
      throw new ValidationError([{ name: "email", type: "emailNotValid" }], "email invalid");
    }

    // Don't allow using an address somebody else uses
    const existingUser = Accounts.findUserByEmail(newEmail);
    if (existingUser) {
      throw new ValidationError([{ name: "email", type: "emailExists" }], "Email already exists.");
    }

    await Profile.Email.change(user._id, newEmail, "profile change");
  },
  { simulation: false },
);

export const selfRemove = ServerMethod("user.self.remove", async () => {
  const user = await Meteor.userAsync();
  if (user) {
    Users.remove({ _id: user._id });
  }
});

export const AdminRemoveOptionsPattern = {
  /** On true the courses (and events) created by the user will also be deleted */
  courses: Match.Maybe(Boolean),
};

export type AdminRemoveOptions = Type<typeof AdminRemoveOptionsPattern>;

export const adminRemove = ServerMethod(
  "user.admin.remove",
  async (userId: string, reason: string, options: AdminRemoveOptions = {}) => {
    check(userId, SafeString());
    check(reason, SafeString());
    check(options, Match.Maybe(AdminRemoveOptionsPattern));

    const operatorId = Meteor.userId();

    if (!operatorId || !UserPrivilegeUtils.privilegedTo("admin")) {
      return;
    }

    const deletedCourses: Course[] = [];
    let numberOfDeletedEvents = 0;
    if (options.courses) {
      // Remove courses created by this user
      (await Courses.find({ createdby: userId }).fetchAsync()).forEach((course) => {
        deletedCourses.push(course);
        numberOfDeletedEvents += Events.remove({ courseId: course._id });
      });

      await Courses.removeAsync({ createdby: userId });
    }

    // Updated courses and events he is involted
    const courses = Courses.find({ "members.user": userId }).fetch();

    // eslint-disable-next-line no-restricted-syntax
    for await (const course of courses) {
      await Events.updateAsync(
        { courseId: course._id },
        { $pull: { editors: userId } },
        { multi: true },
      );
      await Events.updateAsync(
        { courseId: course._id },
        { $pull: { participants: { user: userId } } },
        { multi: true },
      );

      await Courses.updateAsync({ _id: course._id }, { $pull: { members: { user: userId } } });
      await Courses.updateAsync({ _id: course._id }, { $pull: { editors: userId } });

      // Update member related calculated fields
      await courseInterestedDenormalizer.afterUserAdminRemove(course._id);
      Courses.updateGroups(course._id);
    }

    const user = (await Users.findOneAsync(userId)) as any;

    delete user.services;

    await Users.removeAsync({ _id: userId });

    await Log.record("user.admin.remove", [operatorId, userId], {
      operatorId,
      reason,
      user,
      deletedCourses,
      numberOfDeletedEvents,
    });
  },
);

export const addPrivilege = ServerMethod(
  "user.addPrivilege",
  async (userId: string, privilege: "admin") => {
    check(userId, SafeString());
    check(privilege, SafeString());

    if (!UserPrivilegeUtils.privilegedTo("admin")) {
      // At the moment, only admins may hand out privileges, so this is easy
      return;
    }

    const user = await Users.findOneAsync({ _id: userId });
    if (!user) {
      throw new Meteor.Error(404, "User not found");
    }
    await Users.updateAsync(
      { _id: user._id },
      { $addToSet: { privileges: privilege } },
      { multi: true },
      AsyncTools.checkUpdateOne,
    );
  },
);

export const removePrivilege = ServerMethod(
  "user.removePrivilege",
  async (userId: string, privilege: "admin") => {
    check(userId, SafeString());
    check(privilege, SafeString());

    const user = await Users.findOneAsync({ _id: userId });
    if (!user) {
      throw new Meteor.Error(404, "User not found");
    }

    const operator = await Meteor.userAsync();

    if (
      !operator ||
      (!UserPrivilegeUtils.privileged(operator, "admin") && operator?._id !== user._id)
    ) {
      return;
    }

    await Users.updateAsync(
      { _id: user._id },
      { $pull: { privileges: privilege } },
      { multi: true },
      AsyncTools.checkUpdateOne,
    );
  },
);

export const setHasContributed = ServerMethod("user.setHasContributed", async (userId: string) => {
  check(userId, SafeString());

  const operator = await Meteor.userAsync();

  if (!operator || !UserPrivilegeUtils.privileged(operator, "admin")) {
    return;
  }

  const user = await Users.findOneAsync({ _id: userId });
  if (!user) {
    throw new Meteor.Error(404, "User not found");
  }

  await Users.updateAsync({ _id: user._id }, { $set: { contribution: new Date() } });

  await Log.record("user.hasContributed.set", [operator?._id, userId], {
    operatorId: operator?._id,
    userId,
  });
});

export const unsetHasContributed = ServerMethod(
  "user.unsetHasContributed",
  async (userId: string) => {
    check(userId, SafeString());

    const operator = await Meteor.userAsync();

    if (!operator || !UserPrivilegeUtils.privileged(operator, "admin")) {
      return;
    }

    const user = await Users.findOneAsync({ _id: userId });
    if (!user) {
      throw new Meteor.Error(404, "User not found");
    }

    await Users.updateAsync({ _id: user._id }, { $unset: { contribution: "" } });

    await Log.record("user.hasContributed.unset", [operator?._id, userId], {
      operatorId: operator?._id,
      userId,
    });
  },
);

export const hidePricePolicy = ServerMethod("user.hidePricePolicy", async () => {
  const userId = Meteor.userId();
  if (!userId) {
    throw new Meteor.Error(401, "please log in");
  }

  await Users.updateAsync(userId, { $set: { hidePricePolicy: true } });
});

export const updateLocale = ServerMethod(
  "user.updateLocale",
  async (locale: string) => {
    check(locale, SafeString());

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "please log in");
    }

    await Users.updateAsync(userId, {
      $set: { locale },
    });
  },
  { simulation: false },
);

export const updateLastLogin = ServerMethod("user.updateLastLogin", async () => {
  const userId = Meteor.userId();
  if (!userId) {
    throw new Meteor.Error(401, "please log in");
  }

  await Users.updateAsync(userId, {
    $set: { lastLogin: new Date() },
  });
});

Meteor.methods({
  /**
   * Recalculate the groups and badges field
   */
  "user.updateBadges"(selector) {
    Users.find(selector).forEach((originalUser) => {
      const userId = originalUser._id;

      AsyncTools.untilClean((resolve, reject) => {
        const user = Users.findOne(userId);

        if (!user) {
          resolve(true);
          return;
        }

        const groups: string[] = [];
        Groups.find({ "members.user": user._id }).forEach((group) => {
          groups.push(group._id);
        });

        const badges = groups.slice();
        badges.push(user._id);

        const update = {
          $set: {
            groups,
            badges,
          },
        };

        Users.rawCollection().updateMany({ _id: user._id }, update, {}, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result?.modifiedCount === 0);
          }
        });
      });
    });
  },
});

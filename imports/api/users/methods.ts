import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { Match, check } from "meteor/check";
import { _ } from "meteor/underscore";
import { ValidationError } from "meteor/mdg:validation-error";

import { Log } from "/imports/api/log/log";
import { Users } from "/imports/api/users/users";
import { Course, Courses } from "/imports/api/courses/courses";
import { Events } from "/imports/api/events/events";
import * as courseInterestedDenormalizer from "/imports/api/courses/interestedDenormalizer";
import * as groupsDenormalizer from "/imports/api/courses/groupsDenormalizer";

import * as HtmlTools from "/imports/utils/html-tools";
import * as Profile from "/imports/utils/profile";
import { isEmail } from "/imports/utils/email-tools";
import * as StringTools from "/imports/utils/string-tools";
import { ServerMethod } from "/imports/utils/ServerMethod";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { HtmlString, StringEnum, Type, UnsafeString } from "/imports/utils/CustomChecks";
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

    const sane = HtmlTools.sanitizeHtml(description, 400);

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
  async (unsafeUsername: string) => {
    check(unsafeUsername, String);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new ValidationError([{ name: "username", type: "plzLogin" }], "Not logged-in");
    }

    let username = StringTools.sanitizeSingleline(unsafeUsername, 200);
    ((PublicSettings.contribution?.forbiddenChars || []) as string[]).forEach((c) => {
      username = username.replace(RegExp(c, "g"), "");
    });
    username = username.trim();

    if (username.length === 0) {
      throw new ValidationError(
        [{ name: "username", type: "noUserName" }],
        "username cannot be empty",
      );
    }

    if (NotAllowedCharacter.find((c) => username.includes(c))) {
      throw new ValidationError(
        [{ name: "username", type: "notAllowedCharacter" }],
        "Not allowed character",
      );
    }

    if (username === user.username) {
      return;
    }

    if (await Accounts.findUserByUsername(username)) {
      throw new ValidationError(
        [{ name: "username", type: "userExists" }],
        "username is already taken",
      );
    }

    const result = await Profile.Username.change(user._id, username);
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

export const updateTheme = ServerMethod(
  "user.updateTheme",
  async (theme: "light" | "system" | "dark") => {
    check(theme, StringEnum("light", "system", "dark"));

    const userId = Meteor.userId();
    if (!userId) {
      throw new ValidationError([{ name: "theme", type: "plzLogin" }], "Not logged-in");
    }

    await Users.updateAsync(userId, { $set: { theme } });
  },
);

/**
 * Update email
 */
export const updateEmail = ServerMethod(
  "user.updateEmail",
  async (email: string) => {
    check(email, String);

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
    const existingUser = await Accounts.findUserByEmail(newEmail);
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
    await Users.removeAsync({ _id: user._id });
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
    check(userId, String);
    check(reason, String);
    check(options, Match.Maybe(AdminRemoveOptionsPattern));

    const operator = await Meteor.userAsync();
    if (!operator?.privileged("admin")) {
      return;
    }

    const deletedCourses: Course[] = [];
    let numberOfDeletedEvents = 0;
    if (options.courses) {
      // Remove courses created by this user
      for (const course of await Courses.find({ createdby: userId }).fetchAsync()) {
        deletedCourses.push(course);
        // eslint-disable-next-line no-await-in-loop
        numberOfDeletedEvents += await Events.removeAsync({ courseId: course._id });
      }

      await Courses.removeAsync({ createdby: userId });
    }

    // Updated courses and events he is involted
    const courses = await Courses.find({ "members.user": userId }).fetchAsync();

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
      await groupsDenormalizer.updateGroups(course._id);
    }

    const user = (await Users.findOneAsync(userId)) as any;

    delete user.services;

    await Users.removeAsync({ _id: userId });

    await Log.record("user.admin.remove", [operator._id, userId], {
      operatorId: operator._id,
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
    check(userId, String);
    check(privilege, String);

    const operator = await Meteor.userAsync();
    if (!operator?.privileged("admin")) {
      // At the moment, only admins may hand out privileges, so this is easy
      return;
    }

    const user = await Users.findOneAsync({ _id: userId });
    if (!user) {
      throw new Meteor.Error(404, "User not found");
    }
    await Users.updateAsync({ _id: user._id }, { $addToSet: { privileges: privilege } });
  },
);

export const removePrivilege = ServerMethod(
  "user.removePrivilege",
  async (userId: string, privilege: "admin") => {
    check(userId, String);
    check(privilege, String);

    const user = await Users.findOneAsync({ _id: userId });
    if (!user) {
      throw new Meteor.Error(404, "User not found");
    }

    const operator = await Meteor.userAsync();
    if (!operator || (!operator.privileged("admin") && operator._id !== user._id)) {
      return;
    }

    await Users.updateAsync({ _id: user._id }, { $pull: { privileges: privilege } });
  },
);

export const setHasContributed = ServerMethod("user.setHasContributed", async (userId: string) => {
  check(userId, String);

  const operator = await Meteor.userAsync();

  if (!operator || !operator.privileged("admin")) {
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
    check(userId, String);

    const operator = await Meteor.userAsync();

    if (!operator || !operator.privileged("admin")) {
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
    check(locale, String);

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

export const removeVisitorFlag = ServerMethod("user.removeVisitorFlag", async () => {
  const userId = Meteor.userId();
  if (!userId) {
    throw new Meteor.Error(401, "please log in");
  }
  await Users.updateAsync(userId, { $pull: { privileges: "visitor" } });
});

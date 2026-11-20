import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import { Users } from "/imports/api/users/users";

import { userSearchPrefix } from "/imports/utils/user-search-prefix";
import { ServerPublishMany, ServerPublishOne } from "/imports/utils/ServerPublish";
import { PasswordResetTokenExpirationInDays } from "/imports/startup/both/UseraccountsConfiguration";

if (Meteor.isServer) {
  // Always publish their own data for logged-in users
  // https://github.com/meteor/guide/issues/651
  Meteor.publish(null, function () {
    return Users.find(this.userId ?? undefined);
  });
}

export const [simple, useSimple] = ServerPublishOne(
  "user.simple",
  (userId: string) => {
    check(userId, String);

    // Public fields from users
    const projection: Mongo.FieldSpecifier = { username: 1, contribution: 1 };

    return Users.find(userId, { projection });
  },
  (userId) => {
    // Public fields from users
    const projection: Mongo.FieldSpecifier = { username: 1, contribution: 1 };

    return Users.findOne(userId, { projection });
  },
);
export const [account, useAccount] = ServerPublishOne(
  "user.account",
  (token: string) => {
    check(token, String);

    // Public fields from users
    const projection: Mongo.FieldSpecifier = {
      username: 1,
      emails: 1,
      privileges: 1,
      "services.password.reset.token": 1,
    };

    const tokenLifetimeMs = PasswordResetTokenExpirationInDays * 86400000;
    const currentTimeMs = Date.now();
    return Users.find(
      {
        "services.password.reset.token": token,
        // From https://github.com/meteor/meteor/blob/5e5d437c6ac79b61f3f750bc022f95fe5b83a961/packages/accounts-password/password_server.js#L636
        "services.password.reset.when": { $gt: new Date(currentTimeMs - tokenLifetimeMs) },
      },
      { projection },
    );
  },
  (token) => {
    // Public fields from users
    const projection: Mongo.FieldSpecifier = {
      username: 1,
      emails: 1,
      privileges: 1,
      "services.password.reset.token": 1,
    };

    return Users.findOne({ "services.password.reset.token": token }, { projection });
  },
);

export const [verify, useHasVerifiedEmail] = ServerPublishOne(
  "user.verify",
  (email: string) => {
    check(email, String);

    return Users.find(
      { "emails.address": email },
      {
        projection: { emails: { $elemMatch: { address: email } } as any },
        transform: (user) => ({
          verified: user.emails?.[0]?.verified,
        }),
      },
    );
  },
  (email) => {
    return Users.findOne(
      { "emails.address": email },
      {
        transform: (user) => ({
          verified: user.emails?.[0]?.verified,
        }),
      },
    );
  },
);

export const [details, useDetails] = ServerPublishOne(
  "user",
  async (userId: string) => {
    check(userId, String);

    // Public fields from users
    const projection: Mongo.FieldSpecifier = {
      username: 1,
      description: 1,
      allowPrivateMessages: 1,
      contribution: 1,
      "avatar.color": 1,
    };

    // Admins can see other's privileges
    if ((await Meteor.userAsync())?.hasPrivilege("admin")) {
      projection.privileges = 1;
    }

    return Users.find(userId, { projection });
  },
  (userId) => {
    // Public fields from users
    const projection: Mongo.FieldSpecifier = {
      username: 1,
      description: 1,
      allowPrivateMessages: 1,
      contribution: 1,
      "avatar.color": 1,
    };

    // Admins can see other's privileges
    if (Meteor.user()?.hasPrivilege("admin")) {
      projection.privileges = 1;
    }

    return Users.findOne(userId, { projection });
  },
);

export const [findFilter, useFindFilter] = ServerPublishMany(
  "userSearch",
  (
    search: string,
    options?: {
      exclude?: string[] | undefined;
    },
  ) => {
    check(search, String);

    return userSearchPrefix(search, {
      exclude: options?.exclude,
      projection: { username: 1 },
      limit: 30,
    });
  },
);

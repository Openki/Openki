import { Meteor } from "meteor/meteor";
import { _ } from "meteor/underscore";
import { ServiceConfiguration } from "meteor/service-configuration";
import { Accounts } from "meteor/accounts-base";

import * as usersMethods from "/imports/api/users/methods";
import { UserModel, UserProfile, Users } from "/imports/api/users/users";

import { isEmail } from "/imports/utils/email-tools";
import { PrivateSettings } from "/imports/utils/PrivateSettings";

Meteor.startup(() => {
  const serviceConf = PrivateSettings.service;
  if (!serviceConf) {
    return;
  }

  if (serviceConf.google) {
    ServiceConfiguration.configurations.upsert(
      {
        service: "google",
      },
      {
        $set: {
          loginStyle: "popup",
          clientId: serviceConf.google.clientId,
          secret: serviceConf.google.secret,
        },
      },
    );
  }
  if (serviceConf.facebook) {
    ServiceConfiguration.configurations.upsert(
      {
        service: "facebook",
      },
      {
        $set: {
          loginStyle: "popup",
          appId: serviceConf.facebook.appId,
          secret: serviceConf.facebook.secret,
        },
      },
    );
  }
  if (serviceConf.github) {
    ServiceConfiguration.configurations.upsert(
      {
        service: "github",
      },
      {
        $set: {
          loginStyle: "popup",
          clientId: serviceConf.github.clientId,
          secret: serviceConf.github.secret,
        },
      },
    );
  }
});

Accounts.validateNewUser((user) => {
  if (user.emails) {
    const email = user.emails[0].address;

    if (!isEmail(email)) {
      throw new Meteor.Error(403, "email invalid");
    }
  }

  return true;
});

Accounts.onCreateUser((options: any, originalUser) => {
  const user = { ...originalUser } as UserModel;
  if (options.profile) {
    user.profile = options.profile as UserProfile;
  } else {
    user.profile = {} as UserProfile;
  }
  // Collect info where a username could possibly be found
  let nameProviders = [user, user.profile];
  if (user.services) {
    nameProviders = nameProviders.concat(_.toArray(originalUser.services));
  }

  // Try to glean a username
  let name;
  let username;
  let provider: { name?: string; username?: string } | undefined;
  /* eslint-disable-next-line no-cond-assign */
  while ((provider = nameProviders.pop()) !== undefined) {
    if (!name && provider.name) {
      name = provider.name;
    }
    if (!username && provider.username) {
      username = provider.username;
    }
  }

  // We're not picky and try assigning a name no questions asked
  user.username = (username || name) as string;
  user.profile.name = (name || username) as string;

  if (!user.privileges) {
    user.privileges = [];
  }

  if (options.visitor) {
    user.privileges.push("visitor");
  }

  // Read email-address if provided
  let providedEmail;
  let verified = true; // Assume verified unless there is a flag that says it's not
  const services = user.services;
  if (services) {
    ["facebook", "google", "github"].forEach((loginProvider) => {
      const provided = (services as any)[loginProvider] as {
        email?: string;
        verified_email?: boolean;
      };
      if (provided?.email) {
        providedEmail = provided.email;
        if (typeof provided.verified_email === "boolean") {
          verified = provided.verified_email;
        }
      }
    });
  }

  if (providedEmail) {
    user.emails = [{ address: providedEmail, verified }];
  }

  user.locale = options.locale;

  user.tenants = [];

  user.groups = [];
  user.badges = [user._id];

  user.notifications = true;
  user.allowPrivateMessages = true;
  user.allowNews = options.allowNews;
  return user;
});

Accounts.onLogin(async (options: any) => {
  await usersMethods.updateLastLogin();

  const user = Meteor.user();

  // generate a avatar color for every new user
  if (user && user.avatar?.color === undefined) {
    await usersMethods.updateAvatarColor();
  }

  // Remove visitor flag after passwort reset. https://github.com/meteor/meteor/blob/devel/packages/accounts-password/password_server.js
  if (options.methodName === "resetPassword" && user?.privileged("visitor")) {
    Users.update(user._id, { $pull: { privileges: "visitor" } });
  }
});

Accounts.config({
  sendVerificationEmail: true,
});

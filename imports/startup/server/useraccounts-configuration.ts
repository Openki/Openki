import { Meteor } from "meteor/meteor";
import { toArray } from "lodash-es";
import { ServiceConfiguration } from "meteor/service-configuration";
import { Accounts } from "meteor/accounts-base";

import * as UsersMethods from "/imports/api/users/methods";
import { UserModel, UserProfile } from "/imports/api/users/users";

import { isEmail } from "/imports/utils/email-tools";
import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { NotAllowedCharacters } from "../both/NotAllowedCharacters";
import {
  LoginExpirationInDays,
  PasswordResetTokenExpirationInDays,
} from "../both/UseraccountsConfiguration";

Meteor.startup(async () => {
  const serviceConf = PrivateSettings.service;
  if (!serviceConf) {
    return;
  }

  if (serviceConf.google) {
    await ServiceConfiguration.configurations.upsertAsync(
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
    await ServiceConfiguration.configurations.upsertAsync(
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
    await ServiceConfiguration.configurations.upsertAsync(
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
  if (serviceConf.c3) {
    await ServiceConfiguration.configurations.upsertAsync(
      {
        service: "c3",
      },
      {
        $set: {
          loginStyle: "redirect",
          clientId: serviceConf.c3.clientId,
          secret: serviceConf.c3.secret,
          authorizeUrl: serviceConf.c3.authorizeUrl,
          tokenUrl: serviceConf.c3.tokenUrl,
          userInfoUrl: serviceConf.c3.userInfoUrl,
        },
      },
    );
  }
});

Accounts.validateNewUser((user) => {
  if (NotAllowedCharacters.find((c) => user.username.includes(c))) {
    throw new Meteor.Error(403, "Not allowed character");
  }

  if (user.emails) {
    const email = user.emails[0].address;

    if (!isEmail(email)) {
      throw new Meteor.Error(403, "email invalid");
    }
  }

  return true;
});

Accounts.onCreateUser(
  /**
  @param {{
      allowNews?: boolean | undefined;
      locale?: string | undefined;
      visitor?: boolean | undefined;
      profile?: UserProfile | undefined;
    }} options
  */
  (options: any, proposedUser) => {
    const user = { ...proposedUser } as UserModel;
    if (options.profile) {
      user.profile = options.profile as UserProfile;
    } else {
      user.profile = {} as UserProfile;
    }
    // Collect info where a username could possibly be found
    let nameProviders = [user, user.profile];
    if (user.services) {
      nameProviders = nameProviders.concat(toArray(proposedUser.services));
    }

    // Try to glean a username
    let name;
    let username;
    let provider: { name?: string; username?: string } | undefined;

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
      ["facebook", "google", "github", "c3"].forEach((loginProvider) => {
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

    if (options.locale) {
      user.locale = options.locale;
    }

    user.allowNews = options.allowNews || false;

    user.tenants = [];

    user.organizations = [];
    user.badges = [user._id];
    user.venues = [];

    user.notifications = true;
    user.allowPrivateMessages = true;

    return user;
  },
);

Accounts.onLogin(async () => {
  await UsersMethods.updateLastLogin();

  const user = await Meteor.userAsync();

  // generate a avatar color for every new user
  if (user && user.avatar?.color === undefined) {
    await UsersMethods.updateAvatarColor();
  }
});

Accounts.config({
  sendVerificationEmail: true,
  loginExpirationInDays: LoginExpirationInDays,
  passwordResetTokenExpirationInDays: PasswordResetTokenExpirationInDays,
  ambiguousErrorMessages: false,
});

import React from "react";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import i18next from "i18next";

import { PublicSettings } from "/imports/utils/PublicSettings";
import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { UserModel } from "/imports/api/users/users";

import { Root } from "/imports/emails/Root";
import { Verify } from "/imports/emails/users/Verify.html";
import { verify } from "/imports/emails/users/verify.text";
import { ResetPassword } from "/imports/emails/users/ResetPassword.html";
import { resetPassword } from "/imports/emails/users/resetPassword.text";
import { Visitor } from "/imports/emails/users/Visitor.html";
import { visitor } from "/imports/emails/users/visitor.text";
import { renderToEmail } from "/imports/utils/renderToEmail";
import { createAccount } from "/imports/emails/users/createAccount.text";
import { CreateAccount } from "/imports/emails/users/CreateAccount.html";
import { toEmailLogo } from "/imports/utils/toEmailLogo";

Accounts.emailTemplates.siteName = PublicSettings.siteName;

if (PrivateSettings.siteEmail) {
  Accounts.emailTemplates.from = PrivateSettings.siteEmail;
}

Accounts.emailTemplates.verifyEmail = {
  subject(user: UserModel) {
    const userModel = user as UserModel;
    const t = i18next.getFixedT(userModel.locale);

    if (userModel.hasPrivilege("visitor")) {
      return t("visitorEmail.subject", "[{SITE}] Welcome to {SITE}, {NAME}", {
        SITE: Accounts.emailTemplates.siteName,
        NAME: userModel.getDisplayName(),
      });
    }

    // normal user account creation
    return t("verifyEmail.subject", "[{SITE}] Welcome to the {SITE} community, {NAME}", {
      SITE: Accounts.emailTemplates.siteName,
      NAME: userModel.getDisplayName(),
    });
  },

  text(user: UserModel, url: string) {
    const userModel = user as UserModel;
    if (userModel.hasPrivilege("visitor")) {
      return visitor(userModel.getDisplayName(), userModel.emailAddress() || "", userModel.locale);
    }

    // normal user account creation
    return verify(
      userModel.getDisplayName(),
      `${url}?email=${userModel.emailAddress()}`,
      userModel.locale,
    );
  },

  async html(user: UserModel, url: string) {
    const userModel = user as UserModel;
    if (userModel.hasPrivilege("visitor")) {
      return renderToEmail(
        <Root
          subject={Accounts.emailTemplates.verifyEmail.subject?.(userModel)}
          logo={await toEmailLogo(PublicSettings.emailLogo)}
        >
          <Visitor
            username={userModel.getDisplayName()}
            email={userModel.emailAddress() || ""}
            lng={userModel.locale}
          />
        </Root>,
      );
    }

    // normal user account creation
    return renderToEmail(
      <Root
        subject={Accounts.emailTemplates.verifyEmail.subject?.(userModel)}
        logo={await toEmailLogo(PublicSettings.emailLogo)}
      >
        <Verify
          username={userModel.getDisplayName()}
          url={`${url}?email=${userModel.emailAddress()}`}
          lng={userModel.locale}
        />
      </Root>,
    );
  },
  // We're intentionally extending the default verifyEmail templates
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

Accounts.urls.resetPassword = function (token) {
  return Meteor.absoluteUrl(`reset-password/${token}`);
};

Accounts.emailTemplates.resetPassword = {
  subject(user: UserModel) {
    const userModel = user as UserModel;
    const t = i18next.getFixedT(userModel.locale);

    if (userModel.hasPrivilege("visitor")) {
      return t("createAccount.subject", "[{SITE}] Login or create your account on {SITE}", {
        SITE: Accounts.emailTemplates.siteName,
      });
    }

    // normal user account creation
    return t("resetPassword.subject", "[{SITE}] Reset your password on {SITE}", {
      SITE: Accounts.emailTemplates.siteName,
    });
  },

  text(user: UserModel, url: string) {
    const userModel = user as UserModel;
    if (userModel.hasPrivilege("visitor")) {
      return createAccount(
        userModel.getDisplayName(),
        `${url.replace("reset-password", "visitor-to-user")}?email=${userModel.emailAddress()}`,
        `${url.replace("reset-password", "auto-login-visitor")}?email=${userModel.emailAddress()}`,
        userModel.locale,
      );
    }

    // normal user account creation
    return resetPassword(
      userModel.getDisplayName(),
      `${url}?email=${userModel.emailAddress()}`,
      userModel.locale,
    );
  },

  async html(user: UserModel, url: string) {
    const userModel = user as UserModel;
    if (userModel.hasPrivilege("visitor")) {
      return renderToEmail(
        <Root
          subject={Accounts.emailTemplates.resetPassword.subject?.(userModel)}
          logo={await toEmailLogo(PublicSettings.emailLogo)}
        >
          <CreateAccount
            username={userModel.getDisplayName()}
            createAccountUrl={`${url.replace(
              "reset-password",
              "visitor-to-user",
            )}?email=${userModel.emailAddress()}`}
            autoLoginUrl={`${url.replace(
              "reset-password",
              "auto-login-visitor",
            )}?email=${userModel.emailAddress()}`}
            lng={userModel.locale}
          />
        </Root>,
      );
    }

    // normal user account creation
    return renderToEmail(
      <Root
        subject={Accounts.emailTemplates.resetPassword.subject?.(userModel)}
        logo={await toEmailLogo(PublicSettings.emailLogo)}
      >
        <ResetPassword
          username={userModel.getDisplayName()}
          url={`${url}?email=${userModel.emailAddress()}`}
          lng={userModel.locale}
        />
      </Root>,
    );
  },
  // We're intentionally extending the default resetPassword templates
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

import React from "react";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import i18next from "i18next";

import { PublicSettings } from "/imports/utils/PublicSettings";
import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { UserModel } from "/imports/api/users/users";

import { Root } from "../../../emails/Root";
import { Verify } from "../../../emails/users/Verify.html";
import { verify } from "../../../emails/users/verify.text";
import { ResetPassword } from "../../../emails/users/ResetPassword.html";
import { resetPassword } from "../../../emails/users/resetPassword.text";
import { Visitor } from "/imports/emails/users/Visitor.html";
import { visitor } from "/imports/emails/users/visitor.text";
import { renderToEmail } from "../../../utils/renderToEmail";
import { createAccount } from "/imports/emails/users/createAccount.text";
import { CreateAccount } from "/imports/emails/users/CreateAccount.html";

Accounts.emailTemplates.siteName = PublicSettings.siteName;

if (PrivateSettings.siteEmail) {
  Accounts.emailTemplates.from = PrivateSettings.siteEmail;
}

Accounts.emailTemplates.verifyEmail = {
  subject(user) {
    const userModel = user as UserModel;
    const t = i18next.getFixedT(userModel.locale);

    if (userModel.privileged("visitor")) {
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

  text(user, url) {
    const userModel = user as UserModel;
    if (userModel.privileged("visitor")) {
      return visitor(userModel.getDisplayName(), userModel.emailAddress() || "", userModel.locale);
    }

    // normal user account creation
    return verify(userModel.getDisplayName(), url, userModel.locale);
  },

  html(user, url) {
    const userModel = user as UserModel;
    if (userModel.privileged("visitor")) {
      return renderToEmail(
        <Root subject={Accounts.emailTemplates.verifyEmail.subject?.(userModel)}>
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
      <Root subject={Accounts.emailTemplates.verifyEmail.subject?.(userModel)}>
        <Verify username={userModel.getDisplayName()} url={url} lng={userModel.locale} />
      </Root>,
    );
  },
};

Accounts.urls.resetPassword = function (token) {
  return Meteor.absoluteUrl(`reset-password/${token}`);
};

Accounts.emailTemplates.resetPassword = {
  subject(user) {
    const userModel = user as UserModel;
    const t = i18next.getFixedT(userModel.locale);

    if (userModel.privileged("visitor")) {
      return t("createAccount.subject", "[{SITE}] Create your account on {SITE}", {
        SITE: Accounts.emailTemplates.siteName,
      });
    }

    // normal user account creation
    return t("resetPassword.subject", "[{SITE}] Reset your password on {SITE}", {
      SITE: Accounts.emailTemplates.siteName,
    });
  },

  text(user, url) {
    const userModel = user as UserModel;
    if (userModel.privileged("visitor")) {
      return createAccount(
        userModel.getDisplayName(),
        `${url.replace("reset-password", "visitor-to-user")}?email=${userModel.emailAddress()}`,
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

  html(user, url) {
    const userModel = user as UserModel;
    if (userModel.privileged("visitor")) {
      return renderToEmail(
        <Root subject={Accounts.emailTemplates.resetPassword.subject?.(userModel)}>
          <CreateAccount
            username={userModel.getDisplayName()}
            url={`${url.replace(
              "reset-password",
              "visitor-to-user",
            )}?email=${userModel.emailAddress()}`}
            lng={userModel.locale}
          />
        </Root>,
      );
    }

    // normal user account creation
    return renderToEmail(
      <Root subject={Accounts.emailTemplates.resetPassword.subject?.(userModel)}>
        <ResetPassword
          username={userModel.getDisplayName()}
          url={`${url}?email=${userModel.emailAddress()}`}
          lng={userModel.locale}
        />
      </Root>,
    );
  },
};

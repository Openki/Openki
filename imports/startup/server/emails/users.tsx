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
import { renderToEmail } from "/imports/utils/renderToEmail";
import { createAccount } from "/imports/emails/users/createAccount.text";
import { CreateAccount } from "/imports/emails/users/CreateAccount.html";

Accounts.emailTemplates.siteName = PublicSettings.siteName;

if (PrivateSettings.siteEmail) {
  Accounts.emailTemplates.from = PrivateSettings.siteEmail;
}

Accounts.emailTemplates.verifyEmail = {
  subject(user) {
    const t = i18next.getFixedT(user.locale);

    if ((user as UserModel).privileged("visitor")) {
      return t("visitorEmail.subject", "[{SITE}] Welcome to {SITE}, {NAME}", {
        SITE: Accounts.emailTemplates.siteName,
        NAME: (user as UserModel).getDisplayName(),
      });
    }

    // normal user account creation
    return t("verifyEmail.subject", "[{SITE}] Welcome to the {SITE} community, {NAME}", {
      SITE: Accounts.emailTemplates.siteName,
      NAME: (user as UserModel).getDisplayName(),
    });
  },

  text(user, url) {
    if ((user as UserModel).privileged("visitor")) {
      return visitor(
        (user as UserModel).getDisplayName(),
        (user as UserModel).emailAddress() || "",
        user.locale,
      );
    }

    // normal user account creation
    return verify((user as UserModel).getDisplayName(), url, user.locale);
  },

  html(user, url) {
    if ((user as UserModel).privileged("visitor")) {
      return renderToEmail(
        <Root subject={Accounts.emailTemplates.verifyEmail.subject?.(user)}>
          <Visitor
            username={(user as UserModel).getDisplayName()}
            email={(user as UserModel).emailAddress() || ""}
            lng={user.locale}
          />
        </Root>,
      );
    }

    // normal user account creation
    return renderToEmail(
      <Root subject={Accounts.emailTemplates.verifyEmail.subject?.(user)}>
        <Verify username={(user as UserModel).getDisplayName()} url={url} lng={user.locale} />
      </Root>,
    );
  },
};

Accounts.urls.resetPassword = function (token) {
  return Meteor.absoluteUrl(`reset-password/${token}`);
};

Accounts.emailTemplates.resetPassword = {
  subject(user) {
    const t = i18next.getFixedT(user.locale);

    if ((user as UserModel).privileged("visitor")) {
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
    if ((user as UserModel).privileged("visitor")) {
      return createAccount((user as UserModel).getDisplayName(), url, user.locale);
    }

    // normal user account creation
    return resetPassword((user as UserModel).getDisplayName(), url, user.locale);
  },

  html(user, url) {
    if ((user as UserModel).privileged("visitor")) {
      return renderToEmail(
        <Root subject={Accounts.emailTemplates.resetPassword.subject?.(user)}>
          <CreateAccount
            username={(user as UserModel).getDisplayName()}
            url={url}
            lng={user.locale}
          />
        </Root>,
      );
    }

    // normal user account creation
    return renderToEmail(
      <Root subject={Accounts.emailTemplates.resetPassword.subject?.(user)}>
        <ResetPassword
          username={(user as UserModel).getDisplayName()}
          url={url}
          lng={user.locale}
        />
      </Root>,
    );
  },
};

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
import { renderToEmail } from "/imports/utils/renderToEmail";
import { resetPassword } from "../../../emails/users/resetPassword.text";

Accounts.emailTemplates.siteName = PublicSettings.siteName;

if (PrivateSettings.siteEmail) {
  Accounts.emailTemplates.from = PrivateSettings.siteEmail;
}

Accounts.emailTemplates.verifyEmail = {
  subject(user) {
    const t = i18next.getFixedT(user.locale);

    return t("verifyEmail.subject", "[{SITE}] Welcome to the {SITE} community, {NAME}", {
      SITE: Accounts.emailTemplates.siteName,
      NAME: (user as UserModel).getDisplayName(),
    });
  },

  text(user, url) {
    return verify((user as UserModel).getDisplayName(), url, user.locale);
  },

  html(user, url) {
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

    return t("resetPassword.subject", "[{SITE}] Reset your password on {SITE}", {
      SITE: Accounts.emailTemplates.siteName,
    });
  },

  text(user, url) {
    return resetPassword((user as UserModel).getDisplayName(), url, user.locale);
  },

  html(user, url) {
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

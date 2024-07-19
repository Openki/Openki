import React from "react";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import i18next from "i18next";

import { PublicSettings } from "/imports/utils/PublicSettings";
import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { UserModel } from "/imports/api/users/users";

import { Root } from "../../../email/root";
import { Verify } from "../../../email/users/verify.html";
import { verify } from "../../../email/users/verify.text";
import { ResetPassword } from "../../../email/users/resetPassword.html";
import { renderToEmail } from "/imports/utils/renderToEmail";
import { resetPassword } from "../../../email/users/resetPassword.text";

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
    const t = i18next.getFixedT(user.locale);

    return verify((user as UserModel).getDisplayName(), url, t);
  },

  html(user, url) {
    const t = i18next.getFixedT(user.locale);

    return renderToEmail(
      <Root subject={Accounts.emailTemplates.verifyEmail.subject?.(user)}>
        <Verify username={(user as UserModel).getDisplayName()} url={url} t={t} />
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
    const t = i18next.getFixedT(user.locale);

    return resetPassword((user as UserModel).getDisplayName(), url, t);
  },

  html(user, url) {
    const t = i18next.getFixedT(user.locale);

    return renderToEmail(
      <Root subject={Accounts.emailTemplates.resetPassword.subject?.(user)}>
        <ResetPassword username={(user as UserModel).getDisplayName()} url={url} t={t} />
      </Root>,
    );
  },
};

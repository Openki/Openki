import React from "react";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import i18next from "i18next";

import { PublicSettings } from "/imports/utils/PublicSettings";
import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { UserModel } from "/imports/api/users/users";
import { toEmailLogo } from "/imports/utils/toEmailLogo";

import { Root } from "./templates/root";
import { Verify } from "./templates/users/verify";
import { ResetPassword } from "./templates/users/resetPassword";
import { renderToEmail } from "/imports/utils/renderToEmail";

const siteName = PublicSettings.siteName;

Accounts.emailTemplates.siteName = siteName;

if (PrivateSettings.siteEmail) {
  Accounts.emailTemplates.from = PrivateSettings.siteEmail;
}

Accounts.emailTemplates.verifyEmail = {
  subject(user) {
    const t = i18next.getFixedT(user.locale);

    return t("verifyEmail.subject", "[{SITE}] Welcome to the {SITE} community, {NAME}", {
      SITE: siteName,
      NAME: (user as UserModel).getDisplayName(),
    });
  },

  text(user, url) {
    const t = i18next.getFixedT(user.locale);

    return `${t("email.base.greeting", {
      USERNAME: (user as UserModel).getDisplayName(),
    })}
	
${t("verifyEmail.email.introduction", {
  SITE: siteName,
})}

${t("verifyEmail.email.verification")}
${url}

${t("email.base.farewell")}
${t("email.base.postscript", {
  SITE: siteName,
})}

${t("email.base.unexpected", {
  REPORTEMAIL: PrivateSettings.reporter.recipient,
})}`;
  },

  html(user, url) {
    const t = i18next.getFixedT(user.locale);
    const emailLogo = PublicSettings.emailLogo;

    return renderToEmail(
      <Root
        subject={Accounts.emailTemplates.verifyEmail.subject?.(user)}
        brand={PublicSettings.theme.brand}
        url={Meteor.absoluteUrl()}
        logo={toEmailLogo(emailLogo)}
        name={siteName}
      >
        <Verify
          siteName={siteName}
          userName={(user as UserModel).getDisplayName()}
          url={url}
          reportEmail={PrivateSettings.reporter.recipient}
          t={t}
        />
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
      SITE: siteName,
    });
  },

  text(user, url) {
    const t = i18next.getFixedT(user.locale);

    return `${t("email.base.greeting", {
      USERNAME: (user as UserModel).getDisplayName(),
    })}
				
${t("resetPassword.email.introduction", {
  SITE: siteName,
})}

${t("resetPassword.email.verification")}
${url}

${t("email.base.farewell")}
${t("email.base.postscript", {
  SITE: siteName,
})}

${t("email.base.unexpected", {
  REPORTEMAIL: PrivateSettings.reporter.recipient,
})}`;
  },

  html(user, url) {
    const t = i18next.getFixedT(user.locale);
    const emailLogo = PublicSettings.emailLogo;

    return renderToEmail(
      <Root
        subject={Accounts.emailTemplates.resetPassword.subject?.(user)}
        brand={PublicSettings.theme.brand}
        url={Meteor.absoluteUrl()}
        logo={toEmailLogo(emailLogo)}
        name={siteName}
      >
        <ResetPassword
          siteName={siteName}
          userName={(user as UserModel).getDisplayName()}
          url={url}
          reportEmail={PrivateSettings.reporter.recipient}
          t={t}
        />
      </Root>,
    );
  },
};

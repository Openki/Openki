import { SSR } from "meteor/meteorhacks:ssr";
import { Meteor } from "meteor/meteor";
import { i18n } from "/imports/startup/both/i18next";
import { Accounts } from "meteor/accounts-base";
import juice from "juice";
import { Spacebars } from "meteor/spacebars";

import { PublicSettings } from "/imports/utils/PublicSettings";
import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { UserModel } from "/imports/api/users/users";
import { toEmailLogo } from "/imports/utils/toEmailLogo";

if (PrivateSettings.siteEmail) {
  Accounts.emailTemplates.from = PrivateSettings.siteEmail;
}

Accounts.emailTemplates.siteName = PublicSettings.siteName;

Meteor.startup(() => {
  SSR.compileTemplate("userVerifyEmail", Assets.getText("emails/users/verify.html"));
  SSR.compileTemplate("userResetPasswordEmail", Assets.getText("emails/users/resetPassword.html"));
});

Accounts.emailTemplates.verifyEmail.subject = function (user) {
  return i18n("verifyEmail.subject", "[{SITE}] Welcome to the {SITE} community, {NAME}", {
    SITE: Accounts.emailTemplates.siteName,
    NAME: (user as UserModel).getDisplayName(),
    lng: user.locale,
  });
};

Accounts.emailTemplates.verifyEmail.text = function (user, url) {
  return `${i18n("email.base.greeting", {
    USERNAME: (user as UserModel).getDisplayName(),
    lng: user.locale,
  })}
	
${i18n("verifyEmail.email.introduction", {
  SITE: Accounts.emailTemplates.siteName,
  lng: user.locale,
})}

${i18n("verifyEmail.email.verification", {
  lng: user.locale,
})}
${url}

${i18n("email.base.farewell", {
  lng: user.locale,
})}
${i18n("email.base.postscript", {
  SITE: Accounts.emailTemplates.siteName,
  lng: user.locale,
})}

${i18n("email.base.unexpected", {
  REPORTEMAIL: PrivateSettings.reporter.recipient,
  lng: user.locale,
})}`;
};

Accounts.emailTemplates.verifyEmail.html = function (user, url) {
  const emailLogo = PublicSettings.emailLogo;
  return juice(
    SSR.render("userVerifyEmail", {
      subject: Accounts.emailTemplates.verifyEmail.subject?.(user),
      siteName: Accounts.emailTemplates.siteName,
      site: {
        brand: PublicSettings.theme.brand,
        url: Meteor.absoluteUrl(),
        logo: toEmailLogo(emailLogo),
        name: Accounts.emailTemplates.siteName,
      },
      username: (user as UserModel).getDisplayName(),
      url,
      reportEmail: Spacebars.SafeString(
        `<a href="mailto:${PrivateSettings.reporter.recipient}">${PrivateSettings.reporter.recipient}</a>`,
      ),
      locale: user.locale,
    }),
  );
};

Accounts.emailTemplates.resetPassword.subject = function (user) {
  return i18n("resetPassword.subject", "[{SITE}] Reset your password on {SITE}", {
    SITE: Accounts.emailTemplates.siteName,
    lng: user.locale,
  });
};

Accounts.urls.resetPassword = function (token) {
  return Meteor.absoluteUrl(`reset-password/${token}`);
};

Accounts.emailTemplates.resetPassword.text = function (user, url) {
  return `${i18n("email.base.greeting", {
    USERNAME: (user as UserModel).getDisplayName(),
    lng: user.locale,
  })}
				
${i18n("resetPassword.email.introduction", {
  SITE: Accounts.emailTemplates.siteName,
  lng: user.locale,
})}

${i18n("resetPassword.email.verification", {
  lng: user.locale,
})}
${url}

${i18n("email.base.farewell", {
  lng: user.locale,
})}
${i18n("email.base.postscript", {
  SITE: Accounts.emailTemplates.siteName,
  lng: user.locale,
})}

${i18n("email.base.unexpected", {
  REPORTEMAIL: PrivateSettings.reporter.recipient,
  lng: user.locale,
})}`;
};

Accounts.emailTemplates.resetPassword.html = function (user, url) {
  const emailLogo = PublicSettings.emailLogo;
  return juice(
    SSR.render("userResetPasswordEmail", {
      subject: Accounts.emailTemplates.resetPassword.subject?.(user),
      siteName: Accounts.emailTemplates.siteName,
      site: {
        brand: PublicSettings.theme.brand,
        url: Meteor.absoluteUrl(),
        logo: toEmailLogo(emailLogo),
        name: Accounts.emailTemplates.siteName,
      },
      username: (user as UserModel).getDisplayName(),
      url,
      reportEmail: Spacebars.SafeString(
        `<a href="mailto:${PrivateSettings.reporter.recipient}">${PrivateSettings.reporter.recipient}</a>`,
      ),
      locale: user.locale,
    }),
  );
};

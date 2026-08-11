import i18next from "i18next";
import { Accounts } from "meteor/accounts-base";
import { PrivateSettings } from "/imports/utils/PrivateSettings";

export function resetPassword(username: string, url: string, lng: string): string {
  const t = i18next.getFixedT(lng);

  const siteName = Accounts.emailTemplates.siteName;
  const reportEmail = PrivateSettings.reporter.recipient;

  return `${t("email.base.greeting", { USER: username })}
				
${t("resetPassword.email.introduction", { SITE: siteName })}

${t("resetPassword.email.verification")}
${url}

${t("email.base.farewell")}
${t("email.base.postscript", { SITE: siteName })}

${t("email.base.unexpected", { REPORTEMAIL: reportEmail })}`;
}

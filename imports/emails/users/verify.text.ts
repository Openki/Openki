import i18next from "i18next";
import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { Accounts } from "meteor/accounts-base";

export function verify(username: string, url: string, lng: string): string {
  const t = i18next.getFixedT(lng);

  const siteName = Accounts.emailTemplates.siteName;
  const reportEmail = PrivateSettings.reporter.recipient;

  return `${t("email.base.greeting", { USER: username })}
	
${t("verifyEmail.email.introduction", { SITE: siteName })}

${t("verifyEmail.email.verification")}
${url}

${t("email.base.farewell")}
${t("email.base.postscript", { SITE: siteName })}

${t("email.base.unexpected", { REPORTEMAIL: reportEmail })}`;
}

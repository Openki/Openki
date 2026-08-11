import i18next from "i18next";
import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { Accounts } from "meteor/accounts-base";
import { Router } from "meteor/iron:router";

export function visitor(username: string, email: string, lng: string): string {
  const t = i18next.getFixedT(lng);

  const siteName = Accounts.emailTemplates.siteName;
  const reportEmail = PrivateSettings.reporter.recipient;

  return `${t("email.base.greeting", { USER: username })}
	
${t("visitorEmail.email.introduction", { SITE: siteName })}

${t("visitorEmail.email.instructions", { SITE: siteName })}
${Router.url("resetPasswordEmail", {}, { query: { email, campaign: "visitor" } })}

${t("visitorEmail.email.weUseYourEmail", { SITE: siteName })}

${t("email.base.farewell")}
${t("email.base.postscript", { SITE: siteName })}

${t("email.base.unexpected", { REPORTEMAIL: reportEmail })}`;
}

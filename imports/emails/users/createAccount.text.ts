import i18next from "i18next";
import { Accounts } from "meteor/accounts-base";
import { PrivateSettings } from "/imports/utils/PrivateSettings";

export function createAccount(
  username: string,
  createAccountUrl: string,
  autoLoginUrl: string,
  lng: string,
): string {
  const t = i18next.getFixedT(lng);

  const siteName = Accounts.emailTemplates.siteName;
  const reportEmail = PrivateSettings.reporter.recipient;

  return `${t("email.base.greeting", { USER: username })}
				
${t("createAccount.email.introduction", { SITE: siteName })}

${t("createAccount.email.autoLogin")}
${autoLoginUrl}

${t("createAccount.email.accountCreation")}
${createAccountUrl}

${t("email.base.postscript", { SITE: siteName })}

${t("email.base.unexpected", { REPORTEMAIL: reportEmail })}`;
}

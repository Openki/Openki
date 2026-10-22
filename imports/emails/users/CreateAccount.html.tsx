import React from "react";
import { useTranslation } from "react-i18next";
import { Accounts } from "meteor/accounts-base";

import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { getFragmentsWithKeys } from "/imports/ui/lib/getFragmentsWithKeys";

export function CreateAccount({
  username,
  createAccountUrl,
  autoLoginUrl,
  lng,
}: {
  username: string;
  createAccountUrl: string;
  autoLoginUrl: string;
  lng: string;
}) {
  const { t } = useTranslation(undefined, { lng });

  const siteName = Accounts.emailTemplates.siteName;
  const reportEmail = PrivateSettings.reporter.recipient;

  return (
    <>
      <tr>
        <td>
          <h5 className="title">{t("email.base.greeting", { USER: username })}</h5>
          <p>
            {t(
              "createAccount.email.introduction",
              "You were previously interacting as guest on {SITE}.",
              {
                SITE: siteName,
              },
            )}
          </p>
          <p className="gap-md">
            {t("createAccount.email.autoLogin", "You can either continue as guest")}
          </p>
          <p className="text-center">
            <a className="button" href={autoLoginUrl}>
              {t("createAccount.email.autoLoginButton", "Continue as guest")}
            </a>
          </p>
          <p className="gap-md">
            {t(
              "createAccount.email.accountCreation",
              "Or you can choose a password and hence create your account.",
            )}
          </p>
          <p className="text-center">
            <a className="button" href={createAccountUrl}>
              {t("createAccount.email.accountCreateButton", "Create account")}
            </a>
          </p>
          <p>{t("email.base.postscript", { SITE: siteName })}</p>
        </td>
      </tr>
      <tr>
        <td>
          <table className="footer">
            <tr>
              <td>
                {getFragmentsWithKeys(
                  t("email.base.unexpected", {
                    REPORTEMAIL: <a href={`mailto:${reportEmail}`}>{reportEmail}</a>,
                  }),
                )}{" "}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </>
  );
}

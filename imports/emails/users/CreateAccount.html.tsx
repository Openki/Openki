import React from "react";
import { Accounts } from "meteor/accounts-base";
import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { useTranslation } from "react-i18next";

export function CreateAccount({
  username,
  url,
  lng,
}: {
  username: string;
  url: string;
  lng: string;
}) {
  const { t } = useTranslation(undefined, { lng });

  const siteName = Accounts.emailTemplates.siteName;
  const reportEmail = PrivateSettings.reporter.recipient;

  return (
    <>
      <tr>
        <td>
          <h5 className="title">{t("email.base.greeting", { USERNAME: username })}</h5>
          <p>
            {t(
              "createAccount.email.introduction",
              "You requested creating a user account on {SITE}.",
              { SITE: siteName },
            )}
          </p>
          <p className="gap-md">
            {t(
              "createAccount.email.accountCreation",
              "You can click this link to choose a password and create your account.",
            )}
          </p>
          <p className="text-center">
            <a className="button" href={url}>
              {t("createAccount.email.accountCreateButton", "Create account")}
            </a>
          </p>
          <p>
            {t("email.base.farewell")}
            <br />
            {t("email.base.postscript", { SITE: siteName })}
          </p>
        </td>
      </tr>
      <tr>
        <td>
          <table className="footer">
            <tr>
              <td>
                {t("email.base.unexpected", {
                  REPORTEMAIL: <a href={`mailto:${reportEmail}`}>{reportEmail}</a>,
                })}{" "}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </>
  );
}

import React from "react";
import { Accounts } from "meteor/accounts-base";
import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";

export function Visitor({
  username,
  email,
  lng,
}: {
  username: string;
  email: string;
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
          <p>{t("visitorEmail.email.introduction", "Welcome to {SITE}", { SITE: siteName })}</p>
          <p>
            {t(
              "visitorEmail.email.instructions",
              "You just interacted as a guest. To create a user account you can click here and choose a password. This will allow you to log in again later, log in from an other device and change your content on the platform.",
              { SITE: siteName },
            )}
          </p>
          <p className="text-center">
            <a
              className="button"
              href={Router.url("resetPasswordEmail", {}, { query: { email, campaign: "visitor" } })}
            >
              {t("visitorEmail.email.createAccount", "Create a user account")}
            </a>
          </p>
          <p>
            {t(
              "visitorEmail.email.weUseYourEmail",
              "We will use your email address, to keep you up to date about your interaction on {SITE}.",
              { SITE: siteName },
            )}
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
                })}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </>
  );
}

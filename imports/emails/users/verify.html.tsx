import React from "react";
import { Accounts } from "meteor/accounts-base";
import { TFunction } from "i18next";
import { Router } from "meteor/iron:router";
import { PrivateSettings } from "/imports/utils/PrivateSettings";

export function Verify({ username, url, t }: { username: string; url: string; t: TFunction }) {
  const siteName = Accounts.emailTemplates.siteName;
  const reportEmail = PrivateSettings.reporter.recipient;

  return (
    <>
      <tr>
        <td>
          <h5 className="title">{t("email.base.greeting", { USERNAME: username })}</h5>
          <p>
            {t(
              "verifyEmail.email.introduction",
              "We're happy that you are part of the {SITE} community.",
              { SITE: siteName },
            )}
          </p>
          <p className="gap-md">
            {t(
              "verifyEmail.email.verification",
              "Please click this link to verify your e-mail address. This helps verify you're a real person.",
            )}
          </p>
          <p className="text-center">
            <a className="button" href={url}>
              {t("verifyEmail.email.verifyButton", "Verify email address")}
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
                <a href={Router.url("profile")}>{t("email.base.profileLink")}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </>
  );
}

import React from "react";
import { TFunction } from "i18next";
import { Router } from "meteor/iron:router";

export function Verify({
  siteName,
  userName,
  url,
  reportEmail,
  t,
}: {
  siteName: string;
  userName: string;
  url: string;
  reportEmail: string;
  t: TFunction;
}) {
  return (
    <>
      <tr>
        <td>
          <h5 className="title">{t("email.base.greeting", { USERNAME: userName })}</h5>
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

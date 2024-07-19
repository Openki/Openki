import React from "react";
import { TFunction } from "i18next";
import { Router } from "meteor/iron:router";

export function ResetPassword({
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
              "resetPassword.email.introduction",
              "You requested resetting your password on {SITE}.",
              { SITE: siteName },
            )}
          </p>
          <p className="gap-md">
            {t(
              "resetPassword.email.verification",
              "You can click this link to reset your password. If you did not request this message, you can safely discard it.",
            )}
          </p>
          <p className="text-center">
            <a className="button" href={url}>
              {t("resetPassword.email.passwordResetButton", "Reset password")}
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

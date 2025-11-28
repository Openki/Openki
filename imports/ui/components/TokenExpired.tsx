import React from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";
import { ActionResult } from "./ActionResult";

export function TokenExpired({ email }: { email: string }) {
  const { t } = useTranslation();

  return (
    <ActionResult
      type="failed"
      title={t("resetPassword.tokenExpired.message", "This link has expired.")}
      actions={[
        <>
          <a
            className="btn btn-lg btn-secondary"
            href={Router.path("resetPasswortEmail", {}, { query: { email } })}
          >
            {t("resetPassword.tokenExpired.button", "Send me a new one")}
          </a>{" "}
          <small>
            <i className="fa-solid fa-circle-info fa-fw" />{" "}
            {t(
              "resetPassword.tokenExpired.info",
              "It can take some minutes for the email to arrive in your inbox.",
            )}
          </small>
        </>,
      ]}
    />
  );
}

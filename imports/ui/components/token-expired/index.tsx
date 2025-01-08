import React from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";

export function TokenExpired({ email }: { email: string }) {
  const { t } = useTranslation();

  return (
    <div className="container mt-3">
      <div className="alert alert-danger" role="alert">
        <div className="display-1">
          <i className="fa-solid fa-triangle-exclamation fa-lg fa-fw"></i>
          {t("resetPassword.tokenExpired.message", "This link has expired.")}
        </div>
        <hr className="border border-black" />
        <p className="mb-0 fs-2">
          <a
            className="btn btn-lg btn-success fs-2"
            href={Router.path("resetPasswortEmail", {}, { query: { email } })}
          >
            {t("resetPassword.tokenExpired.button", "Send me a new one")}
          </a>{" "}
          <small>
            <i className="fa-solid fa-circle-info"></i>{" "}
            {t(
              "resetPassword.tokenExpired.info",
              "It can take some minutes for the email to arrive in your inbox.",
            )}
          </small>
        </p>
      </div>
    </div>
  );
}

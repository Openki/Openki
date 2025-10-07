import React from "react";
import { Accounts } from "meteor/accounts-base";
import { useUser } from "/imports/utils/react-meteor-data";
import { useTranslation } from "react-i18next";

export function LoginButton() {
  const { t } = useTranslation();
  const user = useUser();

  if (!Accounts.loginServicesConfigured()) {
    return null;
  }

  if (user) {
    return (
      <a
        data-test="navbar-login-button"
        className="nav-link text-white"
        aria-expanded="false"
        data-bs-toggle="dropdown"
        role="button"
      >
        <span className="fa-solid fa-user fa-fw" aria-hidden="true" /> {user.getDisplayName()}
      </a>
    );
  }

  return (
    <a
      data-test="navbar-login-button"
      className="nav-link text-white"
      role="button"
      onClick={() => {
        Session.set("pleaseLogin", true);
      }}
    >
      <span className="fa-solid fa-right-to-bracket fa-fw" aria-hidden="true" />{" "}
      {t("login.navig.unlogged", "Log in/register")}
    </a>
  );
}

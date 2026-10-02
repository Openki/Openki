import React from "react";
import { Accounts } from "meteor/accounts-base";
import { useUser } from "/imports/ui/hooks/react-meteor-data";
import { useTranslation } from "react-i18next";

export function LoginButton() {
  const { t } = useTranslation();
  const user = useUser();

  if (!Accounts.loginServicesConfigured()) {
    return null;
  }

  if (user) {
    return (
      <button
        data-test="navbar-login-button"
        className="btn btn-link nav-link text-white rounded-0 w-100"
        aria-expanded="false"
        data-bs-toggle="dropdown"
      >
        <i className="fa-solid fa-user fa-fw" /> {user.getDisplayName()}
      </button>
    );
  }

  return (
    <button
      data-test="navbar-login-button"
      className="btn btn-link nav-link text-white rounded-0 w-100"
      onClick={() => {
        Session.set("pleaseLogin", true);
      }}
    >
      <i className="fa-solid fa-right-to-bracket fa-fw" />{" "}
      {t("login.navig.unlogged", "Log in/register")}
    </button>
  );
}

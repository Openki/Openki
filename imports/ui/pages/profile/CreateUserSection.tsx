import { Router } from "meteor/iron:router";
import React from "react";
import { useTranslation } from "react-i18next";
import { UserModel } from "/imports/api/users/users";

export function CreateUserSection({ user }: { user: UserModel }) {
  const { t } = useTranslation();
  return (
    <div className="page-component page-component-seperated">
      <h3>{t("profile.createUser.title", "Create user")}</h3>
      <p>
        {t(
          "profile.createUser.description",
          "You are currently here as a guest user. If you want to be able to log in with a password and use all features of this plattform, you can create a normal user account here. For this, we will send you an email with the instructions and a link to set a password for your account.",
        )}
      </p>

      <a
        className="button btn btn-primary"
        href={Router.path("resetPasswordEmail", undefined, {
          query: { email: user.emailAddress() },
        })}
      >
        {t("profile.createUser.button", "Send me an account creation email")}
      </a>
    </div>
  );
}

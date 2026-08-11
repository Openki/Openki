import { Router } from "meteor/iron:router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { useSiteName } from "/imports/utils/getSiteName";
import { MetaTags } from "/imports/ui/components/MetaTags";
import { AccountsAsync } from "/imports/utils/promisify";
import { cx } from "/imports/utils/cx";

import * as Alert from "/imports/api/alerts/alert";
import * as UsersMethods from "/imports/api/users/methods";
import { useAccount } from "/imports/api/users/publications";

import { useValidation } from "/imports/ui/lib/useValidation";

import { TokenExpired } from "../../components/TokenExpired";

export interface Props {
  email: string;
  token: string;
}

export function VisitorToUserPage({ token, email }: Props) {
  const { t } = useTranslation();
  const [isLoading, user] = useAccount(token);
  const siteName = useSiteName();

  const [isBusy, setIsBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [errors, checkValidity, addError] = useValidation({
    noPassword: {
      text: () => t("register.warning.noPasswordProvided", "Please enter a password to register."),
      field: "password",
      isValid: () => !!password,
    },
  });

  if (isLoading()) {
    return null;
  }

  if (!user) {
    return <TokenExpired email={email} />;
  }

  return (
    <>
      <MetaTags title={t("visitorToUser.siteTitle", "Create Account")} />

      <div className="container mw-md">
        <h1>{t("visitorToUser.title", "Create Account")}</h1>
        <p>
          {t("visitorToUser.hi", "Hi {USER}", {
            USER: user?.getDisplayName(),
          })}
          <br />
          {t("visitorToUser.text", "Please choose a password to create your {SITENAME} account.", {
            SITENAME: siteName,
          })}
        </p>
        <form
          onSubmit={async (event) => {
            event.preventDefault();

            if (!checkValidity()) {
              return;
            }

            setIsBusy(true);

            try {
              await AccountsAsync.resetPassword(token, password);
              UsersMethods.removeVisitorFlag();

              Alert.success(t("visitorToUser.success.", "Your account is now created."));
              Router.go("profile");
            } catch (err) {
              if (!(err instanceof Meteor.Error && err.reason && addError(err.reason))) {
                Alert.serverError(err);
              }
            } finally {
              setIsBusy(false);
            }
          }}
        >
          <div className="mb-3">
            <div className="input-group">
              <span className="input-group-text">
                <i className="fa-solid fa-user fa-fw" />
              </span>
              <input
                className="form-control"
                type="text"
                placeholder={t("frame.login.username", "Username")}
                value={user?.getDisplayName()}
                readOnly
                disabled
              />
            </div>
          </div>
          <div className="mb-3">
            <div className="row g-2 align-items-center">
              <div className="col">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fa-solid fa-envelope fa-fw" />
                  </span>
                  <input
                    className="form-control"
                    placeholder={t("frame.login.email", "E-Mail")}
                    type="email"
                    value={user?.emailAddress()}
                    readOnly
                    disabled
                  />
                </div>
              </div>
            </div>
            <div className="text-body-secondary">
              {t(
                "visitorToUser.email.description",
                "You can change your username and email address in the settings later.",
              )}
            </div>
          </div>
          <div className="mb-3">
            <div className={cx("input-group", !!errors.password && "has-validation")}>
              <span className="input-group-text">
                <i className="fa-solid fa-lock fa-fw" />
              </span>
              <input
                className={cx("form-control", !!errors.password && "is-invalid")}
                placeholder={t("_inputField.password")}
                type="password"
                autoFocus
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {!!errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-add" disabled={isBusy}>
              {isBusy ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin fa-fw" />{" "}
                  {t("login.register.submit.busy", "Registering…")}
                </>
              ) : (
                t("login.register.submit")
              )}
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => Router.go("home")}>
              {t("_button.cancel")}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// for Blaze
import "./template.html";

Template.registerHelper("VisitorToUserPage", () => VisitorToUserPage);

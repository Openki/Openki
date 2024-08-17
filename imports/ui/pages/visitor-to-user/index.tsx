import React, { useEffect, useState } from "react";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { AccountsAsync } from "/imports/utils/promisify";
import { useSiteName } from "/imports/utils/getSiteName";
import * as Metatags from "/imports/utils/metatags";

import * as Alert from "/imports/api/alerts/alert";

import { useValidation } from "/imports/ui/lib/useValidation";
import { useUser } from "/imports/utils/react-meteor-data";

export type Props = {
  username: string;
  email: string;
  token: string;
};

export function VisitorToUserPage({ username, email, token }: Props) {
  const { t } = useTranslation();
  const user = useUser();
  const siteName = useSiteName();

  const [isBusy, setIsBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [errors, checkValidity, addError] = useValidation({
    noPassword: {
      text: () => t("register.warning.noPasswordProvided", "Please enter a password to register."),
      field: "password",
      onCheckValidity: () => !!password,
    },
  });

  useEffect(() => {
    Metatags.setCommonTags(t("visitorToUser.siteTitle", "Create Account"));
  });

  return (
    <div className="container mw-md">
      <h1>{t("visitorToUser.title", "Create Account")}</h1>
      <p>
        {t("visitorToUser.hi", "Hi {USERNAME}", {
          USERNAME: user?.getDisplayName(),
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

            Alert.success(t("visitorToUser.success.", "Your account is now created."));
            Router.go("profile");
          } catch (err) {
            addError(err.reason);
          } finally {
            setIsBusy(false);
          }
        }}
      >
        <div className="mb-3">
          <div className="input-group has-validation">
            <span className="input-group-text">
              <span className="fa-solid fa-user fa-fw" aria-hidden="true"></span>
            </span>
            <input
              className={`form-control`}
              type="text"
              placeholder={t("frame.login.username", "Username")}
              value={username}
              readOnly
              disabled
            />
          </div>
        </div>
        <div className="mb-3">
          <div className="row g-2 align-items-center">
            <div className="col">
              <div className="input-group has-validation">
                <span className="input-group-text">
                  <span className="fa-solid fa-envelope fa-fw" aria-hidden="true"></span>
                </span>
                <input
                  className={`form-control`}
                  placeholder={t("frame.login.email", "E-Mail")}
                  type="email"
                  value={email}
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
          <div className="input-group has-validation">
            <span className="input-group-text">
              <span className="fa-solid fa-lock fa-fw" aria-hidden="true"></span>
            </span>
            <input
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              placeholder={t("_inputField.password")}
              type="password"
              autoFocus
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
            />
            {errors.password ? <div className="invalid-feedback">{errors.password}</div> : null}
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-add" disabled={isBusy}>
            {isBusy ? (
              <>
                <span className="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></span>{" "}
                {t("login.register.submit.busy", "Registering…")}
              </>
            ) : (
              t("login.register.submit")
            )}
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              Router.go("/");
            }}
          >
            {t("_button.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("VisitorToUserPage", () => VisitorToUserPage);

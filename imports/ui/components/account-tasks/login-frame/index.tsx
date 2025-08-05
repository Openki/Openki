import { MeteorAsync } from "/imports/utils/promisify";
import { useTranslation } from "react-i18next";
import { useSession, useSessionEquals } from "/imports/utils/react-meteor-data";
import React, { useState } from "react";

import * as Alert from "/imports/api/alerts/alert";
import * as UsersMethods from "/imports/api/users/methods";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";

import { useSiteName } from "/imports/utils/getSiteName";
import { PublicSettings } from "/imports/utils/PublicSettings";

import * as Analytics from "/imports/ui/lib/analytics";

import { useValidation } from "../../../lib/useValidation";

import "./styles.scss";

export interface Props {
  username: string;
  password: string;
  onForgotPassword: (loginData: { username: string; password: string }) => void;
  onVisitorOpen: (loginData: { username: string }) => void;
  onRegisterOpen: (loginData: { username: string; password: string }) => void;
  onLogin: () => void;
}

export function LoginFrame({
  username,
  password,
  onForgotPassword,
  onVisitorOpen,
  onRegisterOpen,
  onLogin,
}: Props) {
  const { t } = useTranslation();
  const visitorUserAllowed = useSessionEquals("visitorUserAllowed", true);
  const siteName = useSiteName();
  const currentRegion = useCurrentRegion();
  const locale = useSession("locale");

  const [isBusy, setIsBusy] = useState<false | "Password" | "Google" | "Facebook" | "Github">(
    false,
  );
  const [loginData, setLoginData] = useState({ username, password });

  const [errors, checkValidity, addError] = useValidation({
    noUsername: {
      text: () =>
        t("login.warning.noUserName", "Please enter your username or e-mail address to log in."),
      field: "username",
      onCheckValidity: () => !!loginData.username,
    },
    "Incorrect password": {
      text: () => t("login.password.password_incorrect", "Incorrect password"),
      field: "password",
      onCheckValidity: () => !!loginData.password,
    },
    "User not found": {
      text: () => t("login.username.usr_doesnt_exist", "This user does not exist."),
      field: "username",
    },
    "User has no password set": {
      text: () => t("login.username.no_password_set", "Please log in below."),
      field: "username",
    },
  });

  const oAuthServices: {
    key: string;
    name: string;
    serviceName: "Google" | "Facebook" | "Github";
  }[] = [];
  const login = PublicSettings.feature.login;
  if (login.google) {
    oAuthServices.push({
      key: "google",
      name: "Google",
      serviceName: "Google",
    });
  }
  if (login.facebook) {
    oAuthServices.push({
      key: "facebook",
      name: "Facebook",
      serviceName: "Facebook",
    });
  }
  if (login.github) {
    oAuthServices.push({
      key: "github",
      name: "GitHub",
      serviceName: "Github",
    });
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();

        if (!checkValidity()) {
          return;
        }

        setIsBusy("Password");
        try {
          await MeteorAsync.loginWithPassword(loginData.username, loginData.password);

          onLogin();

          if (currentRegion) {
            await UsersMethods.regionChange(currentRegion._id);
          }

          await UsersMethods.updateLocale(locale);

          Analytics.trackEvent("Logins", "Logins with password", currentRegion?.nameEn);
        } catch (err) {
          addError(err.reason);
        } finally {
          setIsBusy(false);
        }
      }}
    >
      <div className="login">
        <div className="mb-3">
          <div className="input-group has-validation">
            <span className="input-group-text">
              <span className="fa-solid fa-user fa-fw" aria-hidden="true"></span>
            </span>
            <input
              className={`form-control ${errors.username ? "is-invalid" : ""}`}
              placeholder={t("frame.login.usernameOrEmail", "Username or e-mail address")}
              type="text"
              autoFocus={true}
              value={loginData.username}
              onChange={(event) => {
                setLoginData({
                  ...loginData,
                  username: event.target.value,
                });
              }}
            />
            {!!errors.username && <div className="invalid-feedback">{errors.username}</div>}
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
              value={loginData.password}
              onChange={(event) => {
                setLoginData({
                  ...loginData,
                  password: event.target.value,
                });
              }}
            />
            {!!errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>
        </div>
        <div className="mb-3 text-end">
          <button
            type="button"
            className="btn btn-link p-0 js-forgot-pwd-btn forgot-pwd-mail-info"
            onClick={() => {
              onForgotPassword(loginData);
            }}
          >
            {t("forgot", "I forgot my password")}
          </button>
        </div>
        <div className="mb-3">
          <button
            type="submit"
            className="btn btn-secondary js-login form-control"
            disabled={!!isBusy}
          >
            {isBusy === "Password" ? (
              <>
                <span className="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></span>{" "}
                {t("login.login.submit.busy", "Logging in…")}
              </>
            ) : (
              t("login.login.submit", "Log in")
            )}
          </button>
        </div>
        <hr />
        {oAuthServices.map((service) => (
          <React.Fragment key={service.key}>
            <div className="row g-2 align-items-center">
              <div className="col">
                <button
                  className={`btn btn-${service.key} form-control js-oauth-btn my-2`}
                  type="button"
                  disabled={!!isBusy}
                  onClick={() => {
                    const loginMethod = Meteor[`loginWith${service.serviceName}`];
                    if (!loginMethod) {
                      throw new Error(`don't have login method for ${service.serviceName}`);
                    }
                    setIsBusy(service.serviceName);

                    loginMethod({}, async (err) => {
                      try {
                        if (!err) {
                          onLogin();

                          if (currentRegion) {
                            await UsersMethods.regionChange(currentRegion._id);
                          }

                          await UsersMethods.updateLocale(locale);

                          Analytics.trackEvent(
                            "Logins",
                            `Logins with ${service}`,
                            currentRegion?.nameEn,
                          );
                        } else {
                          Alert.serverError(err);
                        }
                      } finally {
                        setIsBusy(false);
                      }
                    });
                  }}
                >
                  {isBusy === service.serviceName ? (
                    <>
                      <span
                        className="fa-solid fa-circle-notch fa-spin fa-fw"
                        aria-hidden="true"
                      ></span>{" "}
                      {t("login.OAuth.busy", "Logging in with")}
                    </>
                  ) : (
                    <>
                      <span
                        className={`fa-brands fa-${service.key} fa-fw`}
                        aria-hidden="true"
                      ></span>{" "}
                      {t("login.OAuth.loginWith", "Login with")}
                    </>
                  )}{" "}
                  {service.name}
                </button>
              </div>
              <div className="col-auto">
                <a
                  className="text-body-secondary"
                  data-bs-toggle="collapse"
                  href={`#${service.key}-info`}
                  role="button"
                  aria-expanded="false"
                  aria-controls={`${service.key}-info`}
                >
                  <i className="fa-solid fa-circle-info fa-lg" aria-hidden="true"></i>
                </a>
              </div>
            </div>
            <div className="collapse" id={`${service.key}-info`}>
              <div className="text-body-secondary">
                {t(
                  "login.OAuth.info",
                  "{SITENAME} is getting your user-information (username, e-mail address, …) from that service. It will not grant access to data or info about your activity here, except the fact that you logged in.",
                  { SITENAME: siteName },
                )}
              </div>
            </div>
          </React.Fragment>
        ))}
        <hr />
        <div className="row g-2 align-items-center">
          <div className="col">
            <button
              className="btn btn-add form-control js-register-open my-2"
              type="button"
              onClick={() => {
                onRegisterOpen(loginData);
              }}
            >
              {t("login.register.submit", "Create account")}
            </button>
          </div>
        </div>
        {PublicSettings.feature.visitorUser && visitorUserAllowed && (
          <div className="row g-2 align-items-center">
            <div className="col">
              <button
                className="btn btn-add form-control js-visitor-open my-2"
                type="button"
                onClick={() => {
                  onVisitorOpen(loginData);
                }}
              >
                {t("login.visitor.submit", "Continue as visitor")}
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

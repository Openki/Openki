import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSession, useSessionEquals } from "/imports/utils/react-meteor-data";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";
import { useSiteName } from "/imports/utils/getSiteName";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { useValidation } from "../../../lib/useValidation";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { promisify } from "es6-promisify";

import * as Alert from "/imports/api/alerts/alert";
import * as UsersMethods from "/imports/api/users/methods";

import * as Analytics from "/imports/ui/lib/analytics";
import { cx } from "/imports/utils/cx";

import { Button } from "../../Buttons";
import { FormControl } from "/imports/ui/components/form-control";

import "./styles.scss";

export interface Props {
  username: string;
  password: string;
  onForgotPassword: (loginData: { username: string }) => void;
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

  const [isBusy, setIsBusy] = useState<
    false | "Password" | "Google" | "Facebook" | "Github" | "C3"
  >(false);
  const [loginData, setLoginData] = useState({ username, password });

  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    setShowPassword(false);
  }, [username, password]);

  const [errors, checkValidity, addError] = useValidation({
    noUsername: {
      text: () =>
        t("login.warning.noUserName", "Please enter your username or e-mail address to log in."),
      field: "username",
      isValid: () => !!loginData.username,
    },
    "Incorrect password": {
      text: () => t("login.password.password_incorrect", "Incorrect password"),
      field: "password",
      isValid: () => !!loginData.password,
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
    serviceName: "Google" | "Facebook" | "Github" | "C3";
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
  if (login.c3) {
    oAuthServices.push({
      key: "c3",
      name: "C3",
      serviceName: "C3",
    });
  }

  return (
    <form
      noValidate
      onSubmit={async (event) => {
        setShowPassword(false);
        event.preventDefault();

        if (!checkValidity()) {
          return;
        }

        setIsBusy("Password");
        try {
          await Meteor.loginWithPasswordAsync(loginData.username, loginData.password);

          onLogin();

          if (currentRegion) {
            await UsersMethods.regionChange(currentRegion._id);
          }

          await UsersMethods.updateLocale(locale);

          Analytics.trackEvent("Logins", "Logins with password", currentRegion?.nameEn);
        } catch (err) {
          if (!(err instanceof Meteor.Error && err.reason && addError(err.reason))) {
            // unknown error
            Alert.serverError(err);
          }
        } finally {
          setIsBusy(false);
        }
      }}
    >
      <div className="login">
        {PublicSettings.feature.login.email && (
          <>
            <div className="mb-3">
              <FormControl
                id="account-tasks-login-frame-username"
                type="text"
                autoFocus
                prepend="fa-solid fa-user fa-fw"
                label={t("frame.login.usernameOrEmail", "Username or e-mail address")}
                value={loginData.username}
                onChange={(value) => setLoginData({ ...loginData, username: value })}
                error={errors.username}
              />
            </div>
            <FormControl
              id="account-tasks-login-frame-password"
              type={showPassword ? "text" : "password"}
              prepend="fa-solid fa-lock fa-fw"
              label={t("_inputField.password")}
              value={loginData.password}
              onChange={(value: string) => setLoginData({ ...loginData, password: value })}
              error={errors.password}
              append={
                <span className="input-group-text p-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary text-dark rounded-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={cx("fa-fw fa-solid", showPassword ? "fa-eye-slash" : "fa-eye")} />
                  </button>
                </span>
              }
            />
            <div className="mb-3 text-end">
              <button
                type="button"
                className="btn btn-link p-0"
                onClick={() => onForgotPassword(loginData)}
              >
                {t("forgot", "I forgot my password")}
              </button>
            </div>
            <div>
              <Button
                id="account-tasks-login-frame-submit"
                block
                submit
                className="btn-secondary"
                disabled={!!isBusy}
                isBusy={isBusy === "Password"}
                busyText={t("login.login.submit.busy", "Logging in…")}
              >
                {t("login.login.submit", "Log in")}
              </Button>
            </div>
            {oAuthServices.length > 0 && <hr />}
          </>
        )}

        {oAuthServices.length > 0 && (
          <div className="d-grid gap-3">
            {oAuthServices.map((service) => (
              <React.Fragment key={service.key}>
                <div className="row g-2 align-items-center">
                  <div className="col">
                    <Button
                      block
                      id={"account-tasks-login-frame-login-with-" + service.name}
                      className={`btn-${service.key}`}
                      disabled={!!isBusy}
                      onClick={async () => {
                        const loginMethod = Meteor[`loginWith${service.serviceName}`];
                        if (!loginMethod) {
                          throw new Error(`don't have login method for ${service.serviceName}`);
                        }
                        setIsBusy(service.serviceName);

                        try {
                          await promisify(loginMethod)({});

                          onLogin();

                          if (currentRegion) {
                            await UsersMethods.regionChange(currentRegion._id);
                          }

                          await UsersMethods.updateLocale(locale);

                          Analytics.trackEvent(
                            "Logins",
                            `Logins with ${service.serviceName}`,
                            currentRegion?.nameEn,
                          );
                        } catch (err) {
                          if (err instanceof Accounts.LoginCancelledError) {
                            // do not show error if user cancelled the process
                            return;
                          }
                          Alert.serverError(err);
                        } finally {
                          setIsBusy(false);
                        }
                      }}
                      busyText={t("login.OAuth.busy", "Logging in with {SERVICE}", {
                        SERVICE: service.name,
                      })}
                    >
                      <i
                        className={`${service.key === "c3" ? "fa-solid fa-rocket" : "fa-brands fa-" + service.key} fa-fw`}
                      />{" "}
                      {t("login.OAuth.loginWith", "Login with {SERVICE}", {
                        SERVICE: service.name,
                      })}
                    </Button>
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
                      <i className="fa-solid fa-circle-info fa-lg" />
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
          </div>
        )}

        {(PublicSettings.feature.login.email ||
          (PublicSettings.feature.visitorUser && visitorUserAllowed)) && (
          <>
            <hr />
            <div className="d-grid gap-3">
              {PublicSettings.feature.login.email && (
                <Button
                  id="account-tasks-login-frame-register"
                  className="btn-add"
                  onClick={() => onRegisterOpen(loginData)}
                >
                  {t("login.register.submit", "Create account")}
                </Button>
              )}
              {PublicSettings.feature.visitorUser && visitorUserAllowed && (
                <Button
                  id="account-tasks-login-frame-visitor"
                  className="btn-add"
                  onClick={() => onVisitorOpen(loginData)}
                >
                  {t("login.visitor.submit", "Continue as guest")}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </form>
  );
}

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { MeteorAsync } from "/imports/utils/promisify";
import { useSession, useSessionEquals } from "/imports/utils/react-meteor-data";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";
import { useSiteName } from "/imports/utils/getSiteName";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { useValidation } from "../../../lib/useValidation";

import * as Alert from "/imports/api/alerts/alert";
import * as UsersMethods from "/imports/api/users/methods";

import * as Analytics from "/imports/ui/lib/analytics";

import { Button } from "/imports/ui/components/Buttons";
import { FormControl } from "/imports/ui/components/form-control";

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
              type="password"
              prepend="fa-solid fa-lock fa-fw"
              label={t("_inputField.password")}
              value={loginData.password}
              onChange={(value) => setLoginData({ ...loginData, password: value })}
              error={errors.password}
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
                      id={"acctount-tasks-login-frame-login-with-" + service.name}
                      className={`btn-${service.key}`}
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
                                `Logins with ${service.serviceName}`,
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
                      busyText={t("login.OAuth.busy", "Logging in with {SERVICE}", {
                        SERVICE: service.name,
                      })}
                    >
                      <i className={`fa-brands fa-${service.key} fa-fw`} />{" "}
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
                  id="acctount-tasks-login-frame-register"
                  className="btn-add"
                  onClick={() => onRegisterOpen(loginData)}
                >
                  {t("login.register.submit", "Create account")}
                </Button>
              )}
              {PublicSettings.feature.visitorUser && visitorUserAllowed && (
                <Button
                  id="acctount-tasks-login-frame-visitor"
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

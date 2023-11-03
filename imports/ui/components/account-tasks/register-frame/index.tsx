import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";
import { useSession, useUser } from "/imports/utils/react-meteor-data";
import { AccountsAsync } from "/imports/utils/promisify";

import * as Alert from "/imports/api/alerts/alert";
import * as UsersMethods from "/imports/api/users/methods";

import * as Analytics from "/imports/ui/lib/analytics";
import { useValidation } from "/imports/ui/lib/useValidation";

import { DataProtectionLaw } from "./data-protection-law";

export type Props = {
  username: string;
  password: string;
  email: string;
  onRegister: () => void;
  onBack: () => void;
};

export function RegisterFrame({
  username = "",
  password = "",
  email = "",
  onRegister,
  onBack,
}: Props) {
  const { t } = useTranslation();
  const user = useUser();
  const currentRegion = useCurrentRegion();
  const locale = useSession("locale");
  const [isBusy, setIsBusy] = useState(false);
  const [registerData, setRegisterData] = useState({ username, password, email });
  const [errors, checkValidity, addError] = useValidation({
    noUsername: {
      text: () => t("register.warning.noUserName", "Please enter a name for your new user."),
      field: "username",
      onCheckValidity: () => !!registerData.username,
    },
    "Username already exists.": {
      text: () =>
        t(
          "register.warning.userExists",
          "This username is already in use. Please choose another one.",
        ),
      field: "username",
    },
    noPassword: {
      text: () => t("register.warning.noPasswordProvided", "Please enter a password to register."),
      field: "password",
      onCheckValidity: () => !!registerData.password,
    },
    noEmail: {
      text: () =>
        t("register.warning.noEmailProvided", "Please enter an email-address to register."),
      field: "email",
      onCheckValidity: () => !!registerData.email,
    },
    "email invalid": {
      text: () => t("register.warning.emailNotValid"),
      field: "email",
    },
    "Email already exists.": {
      text: () =>
        t(
          "register.warning.emailExists",
          "This email already exists. Have you tried resetting your password?",
        ),
      field: "email",
    },
  });
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();

        if (!checkValidity()) {
          return;
        }

        setIsBusy(true);

        try {
          await AccountsAsync.createUser({
            ...registerData,
            locale,
          } as any);

          onRegister();

          if (currentRegion) {
            await UsersMethods.regionChange(currentRegion._id);
          }

          await UsersMethods.updateLocale(locale);

          if (!user) {
            throw new Error("Unexpected falsy: user");
          }

          Alert.success(
            t(
              "profile.sentVerificationMail",
              'Verification mail has been sent to your address: "{MAIL}".',
              { MAIL: user.emails[0].address },
            ),
          );

          Analytics.trackEvent("Registers", "Registers with password", currentRegion?.nameEn);
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
            className={`form-control ${errors.username ? "is-invalid" : ""}`}
            type="text"
            placeholder={t("frame.login.username", "Username")}
            autoFocus={true}
            onChange={(event) => {
              setRegisterData({
                ...registerData,
                username: event.target.value,
              });
            }}
          />
          {errors.username ? <div className="invalid-feedback">{errors.username}</div> : null}
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
            onChange={(event) => {
              setRegisterData({
                ...registerData,
                password: event.target.value,
              });
            }}
          />

          {errors.password ? <div className="invalid-feedback">{errors.password}</div> : null}
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
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                placeholder={t("frame.login.email", "E-Mail")}
                type="email"
                onChange={(event) => {
                  setRegisterData({
                    ...registerData,
                    email: event.target.value,
                  });
                }}
              />
              {errors.email ? <div className="invalid-feedback">{errors.email}</div> : null}
            </div>
          </div>
          <div className="col-auto">
            <a
              className="text-body-secondary"
              data-bs-toggle="collapse"
              href="#email-info"
              role="button"
              aria-expanded="false"
              aria-controls="email-info"
            >
              <i className="fa-solid fa-circle-info fa-lg" aria-hidden="true"></i>
            </a>
          </div>
        </div>
        <div className="collapse" id="email-info">
          <div className="text-body-secondary">
            {t(
              "login.frame.register.mailDisclaimer",
              "Providing an e-mail address allows other users to contact you and is needed to recover your password in case you forget it.",
            )}
          </div>
        </div>
      </div>
      <DataProtectionLaw />
      <div className="mb-3">
        <button type="submit" className="btn btn-add form-control js-register" disabled={isBusy}>
          {isBusy ? (
            <>
              {" "}
              <span className="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></span>
              {t("login.register.submit.busy", "Registering…")}
            </>
          ) : (
            t("login.register.submit")
          )}
        </button>
      </div>
      <hr />
      <div className="mb-3">
        <button
          className="btn btn-secondary form-control"
          type="button"
          onClick={() => {
            onBack();
          }}
        >
          {t("login.register.backToLogin", "Go back to login")}
        </button>
      </div>
    </form>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("RegisterFrame", () => RegisterFrame);

import React, { useState } from "react";
import { Random } from "meteor/random";
import { useTranslation } from "react-i18next";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";
import { useSession } from "/imports/utils/react-meteor-data";
import { useSiteName } from "/imports/utils/getSiteName";
import { AccountsAsync } from "/imports/utils/promisify";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { Router } from "meteor/iron:router";

import * as UsersMethods from "/imports/api/users/methods";

import * as Analytics from "/imports/ui/lib/analytics";
import { useValidation } from "/imports/ui/lib/useValidation";

import { DataProtectionLaw } from "../data-protection-law";
import { NotAllowedCharacter } from "../../../../startup/both/NotAllowedCharacter";

export type Props = {
  username: string;
  email: string;
  allowNews: boolean;
  onRegister: () => void;
  onBack: () => void;
};

export function VistiorFrame({ username, email, allowNews, onRegister, onBack }: Props) {
  const { t } = useTranslation();
  const currentRegion = useCurrentRegion();
  const sitename = useSiteName();
  const locale = useSession("locale");
  const [isBusy, setIsBusy] = useState(false);
  const [registerData, setRegisterData] = useState({ username, email, allowNews });
  const [errors, checkValidity, addError] = useValidation({
    noUsername: {
      text: () => t("register.warning.noUserName", "Please enter a name for your new user."),
      field: "username",
      onCheckValidity: () => !!registerData.username,
    },
    "Not allowed character": {
      text: () =>
        t("register.warning.notAllowedCharacter", "{CHARACTERS} not allowed in username.", {
          CHARACTERS: NotAllowedCharacter.join(", "),
        }),
      field: "username",
    },
    "Username already exists.": {
      text: () =>
        t(
          "register.warning.userExists",
          "This username is already in use. Please choose another one.",
        ),
      field: "username",
    },
    noEmail: {
      text: () =>
        t("visitor.warning.noEmailProvided", "Please enter an email-address to continue."),
      field: "email",
      onCheckValidity: () => !!registerData.email,
    },
    "email invalid": {
      text: () => t("register.warning.emailNotValid"),
      field: "email",
    },
    "Email already exists.": {
      text: () => (
        <>
          {t("register.warning.emailExists")}{" "}
          <a href={Router.path("resetPasswortEmail", {}, { query: { email: registerData.email } })}>
            {t("register.warning.emailExists.sendEmail")}
          </a>
        </>
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
          await Accounts.createUserAsync({
            ...registerData,
            visitor: true, // used in useraccounts-configuration.ts to set privileges
            password: Random.secret(),
            locale,
          } as any);

          onRegister();

          if (currentRegion) {
            await UsersMethods.regionChange(currentRegion._id);
          }

          await UsersMethods.updateLocale(locale);

          Analytics.trackEvent("Registers", "Visitor", currentRegion?.nameEn);
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
            value={registerData.username}
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
            <span className="fa-solid fa-envelope fa-fw" aria-hidden="true"></span>
          </span>
          <input
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            placeholder={t("frame.visitor.email", "E-Mail")}
            type="email"
            value={registerData.email}
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
      <div className="mb-3">
        {t(
          "login.frame.visitor.mailDisclaimer",
          "Providing an e-mail address allows use to notify you eg. about new events.",
        )}
      </div>
      <DataProtectionLaw />
      {PublicSettings.askNewsletterConsent ? (
        <div className="mb-3">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={registerData.allowNews}
              onChange={(event) => {
                setRegisterData({
                  ...registerData,
                  allowNews: event.target.checked,
                });
              }}
              id="registerFrameAllowNewsCheck"
            />
            <label className="form-check-label" htmlFor="registerFrameAllowNewsCheck">
              {t(
                "login.register.agreeEmails",
                "I agree on receiving occasional emails about {SITENAME}.",
                { SITENAME: sitename },
              )}
            </label>
          </div>
        </div>
      ) : null}
      <div className="mb-3">
        <button type="submit" className="btn btn-add form-control" disabled={isBusy}>
          {isBusy ? (
            <>
              <span className="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></span>{" "}
              {t("login.visitor.submit.busy", "Registering…")}
            </>
          ) : (
            t("login.visitor.submit")
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
          {t("login.visitor.backToLogin", "Go back to login")}
        </button>
      </div>
    </form>
  );
}

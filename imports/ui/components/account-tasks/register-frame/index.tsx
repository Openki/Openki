import { Router } from "meteor/iron:router";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSiteName } from "/imports/utils/getSiteName";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { useSession } from "/imports/utils/react-meteor-data";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";

import * as Alert from "/imports/api/alerts/alert";
import * as UsersMethods from "/imports/api/users/methods";

import * as Analytics from "/imports/ui/lib/analytics";
import { useValidation } from "/imports/ui/lib/useValidation";

import { NotAllowedCharacter } from "../../../../startup/both/NotAllowedCharacter";
import { DataProtectionLaw } from "../data-protection-law";
import { FormCheck } from "/imports/ui/components/FormCheck";
import { FormControl } from "/imports/ui/components/form-control";
import { Button } from "../../Buttons";

export interface Props {
  username: string;
  password: string;
  email: string;
  allowNews: boolean;
  onRegister: () => void;
  onBack: () => void;
}

export function RegisterFrame({ username, password, email, allowNews, onRegister, onBack }: Props) {
  const { t } = useTranslation();
  const currentRegion = useCurrentRegion();
  const sitename = useSiteName();
  const locale = useSession("locale");
  const [isBusy, setIsBusy] = useState(false);
  const [registerData, setRegisterData] = useState({ username, password, email, allowNews });

  // Controls password visibility toggle between plain text and masked input.
  // Security note: password is automatically hidden again on form submit.
  const [showPassword, setShowPassword] = useState(false);
  // Reset password visibility when modal is reopened to prevent
  // accidental exposure on shared devices.
  useEffect(() => {
    setShowPassword(false);
  }, [username, password]);

  const [errors, checkValidity, addError] = useValidation({
    noUsername: {
      text: () => t("register.warning.noUserName", "Please enter a name for your new user."),
      field: "username",
      isValid: () => !!registerData.username,
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
    noPassword: {
      text: () => t("register.warning.noPasswordProvided", "Please enter a password to register."),
      field: "password",
      isValid: () => !!registerData.password,
    },
    noEmail: {
      text: () =>
        t("register.warning.noEmailProvided", "Please enter an email-address to register."),
      field: "email",
      isValid: () => !!registerData.email,
    },
    "email invalid": {
      text: () => t("register.warning.emailNotValid"),
      field: "email",
    },
    "Email already exists.": {
      text: () => (
        <div className="whitespace-pre-line">
          {t(
            "register.warning.emailExists",
            "This email is already in use. We can send you an email to login.",
          )}
          <br />
          <a href={Router.path("resetPasswordEmail", {}, { query: { email: registerData.email } })}>
            {t("register.warning.emailExists.sendEmail", "Ok, send me an email")}
          </a>
        </div>
      ),
      field: "email",
    },
  });
  return (
    <form
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();

        if (!checkValidity()) {
          return;
        }
        // Hide password before submitting to prevent accidental exposure
        // if the user leaves the page after a failed login attempt.
        setShowPassword(false);
        setIsBusy(true);

        try {
          await Accounts.createUserAsync({
            ...registerData,
            locale,
          } as any);

          onRegister();

          if (currentRegion) {
            await UsersMethods.regionChange(currentRegion._id);
          }

          await UsersMethods.updateLocale(locale);

          Alert.success(
            t(
              "profile.sentVerificationMail",
              'Verification mail has been sent to your address: "{MAIL}".',
              { MAIL: registerData.email },
            ),
          );

          Analytics.trackEvent("Registers", "Registers with password", currentRegion?.nameEn);
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
      <div className="mb-3">
        <FormControl
          id="register-frame-username"
          type="text"
          autoFocus
          label={t("frame.login.username", "Username")}
          prepend="fa-solid fa-user fa-fw"
          value={registerData.username}
          onChange={(value) => setRegisterData({ ...registerData, username: value })}
          error={errors.username}
        />
      </div>
      <div className="mb-3">
        <FormControl
          id="register-frame-password"
          type={showPassword ? "text" : "password"}
          label={t("_inputField.password")}
          prepend="fa-solid fa-lock fa-fw"
          value={registerData.password}
          onChange={(value: string) => setRegisterData({ ...registerData, password: value })}
          error={errors.password}
          append={
            <span className="input-group-text p-0">
              <button
                type="button"
                className="btn btn-outline-secondary text-dark"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fa-fw fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
              </button>
            </span>
          }
        />
      </div>
      <div className="mb-3">
        <div className="row g-2">
          <div className="col">
            <FormControl
              id="register-frame-email"
              type="email"
              label={t("frame.login.email", "E-Mail")}
              prepend="fa-solid fa-envelope fa-fw"
              value={registerData.email}
              onChange={(value) => setRegisterData({ ...registerData, email: value })}
              error={errors.email}
            />
          </div>
          <div className="col-auto align-self-center pt-4">
            <a
              className="text-body-secondary mt-2 d-inline-block"
              data-bs-toggle="collapse"
              href="#email-info"
              role="button"
              aria-expanded="false"
              aria-controls="email-info"
            >
              <i className="fa-solid fa-circle-info fa-lg" />
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
      {PublicSettings.askNewsletterConsent && (
        <div className="mb-3">
          <FormCheck
            id="register-frame-allowNews"
            type="box"
            label={t(
              "login.register.agreeEmails",
              "I agree on receiving occasional emails about {SITENAME}.",
              { SITENAME: sitename },
            )}
            checked={registerData.allowNews}
            onChange={(checked) => setRegisterData({ ...registerData, allowNews: checked })}
          />
        </div>
      )}
      <div className="mb-3">
        <Button
          id="register-frame-submit"
          submit
          block
          className="btn-add"
          busyText={t("login.register.submit.busy", "Registering…")}
          isBusy={isBusy}
        >
          {t("login.register.submit")}
        </Button>
      </div>
      <hr />
      <Button
        id="register-frame-back"
        block
        className="btn-secondary"
        onClick={() => onBack()}
        disabled={isBusy}
      >
        {t("login.register.backToLogin", "Go back to login")}
      </Button>
    </form>
  );
}

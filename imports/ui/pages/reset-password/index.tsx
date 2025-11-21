import React, { FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";

import * as Alert from "/imports/api/alerts/alert";
import { useAccount } from "/imports/api/users/publications";

import { AccountsAsync } from "/imports/utils/promisify";
import * as Metatags from "/imports/utils/metatags";

import { ButtonCancel } from "/imports/ui/components/buttons";

export type Props = {
  email: string;
  token: string;
};

export function ResetPasswordPage({ token, email }: Props) {
  const { t } = useTranslation();
  const [isLoading, user] = useAccount(token);

  const [isBusy, setIsBusy] = useState<false | "saving">(false);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordSame, setPasswordSame] = useState(false);
  const [passwordNotSame, setPasswordNotSame] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-shadow
  function updatePassword(password: string, passwordConfirm: string, showPassword: boolean) {
    if (showPassword) {
      setPasswordValid(password.length > 0);
    } else {
      setPasswordSame(password.length > 0 && password === passwordConfirm);
      setPasswordNotSame(
        !!passwordConfirm &&
          password.length <= passwordConfirm.length &&
          password !== passwordConfirm,
      );
      setPasswordValid(password.length > 0 && password === passwordConfirm);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy("saving");

    try {
      await AccountsAsync.resetPassword(token, password);

      Alert.success(t("resetPassword.passwordReset.", "Your password has been reset."));
      Router.go("profile");
    } catch (err) {
      Alert.serverError(err, t("resetPassword.passwordResetError", "Unable to reset password"));
    } finally {
      setIsBusy(false);
    }
  }

  function handelCancel() {
    Router.go("/");
  }

  useEffect(() => {
    Metatags.setCommonTags(t("resetPassword.siteTitle", "Reset password"));
  });

  if (isLoading()) {
    return null;
  }

  if (!user) {
    return (
      <div className="container mt-3">
        <div className="alert alert-danger display-1" role="alert">
          <i className="fa-solid fa-triangle-exclamation fa-lg fa-fw"></i>
          {t(
            "resetPassword.tokenExpired",
            "The token has expired. Start again with Reset password.",
          )}{" "}
          <a href={Router.path("resetPasswortEmail", {}, { query: { email } })}>
            {t("register.warning.emailExists.sendEmail")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mw-md">
      <h1>{t("resetPassword.title", "Reset your password")}</h1>
      <form className="reset-password" onSubmit={handleSubmit}>
        <div className="mb-3">
          <div className="btn-group">
            <button
              type="button"
              className={`btn btn-secondary ${!showPassword ? "active" : ""}`}
              onClick={() => {
                setShowPassword(false);
                updatePassword(password, passwordConfirm, false);
              }}
            >
              {t("resetPassword.confirmPasswordByTyping", "Confirm by typing it again")}
            </button>
            <button
              type="button"
              className={`btn btn-secondary ${showPassword ? "active" : ""}`}
              onClick={() => {
                setShowPassword(true);
                updatePassword(password, passwordConfirm, true);
              }}
            >
              {t("resetPassword.confirmPasswordVisually", "Show what I typed")}
            </button>
          </div>
        </div>
        <fieldset className="mb-3">
          <label className="form-label" htmlFor="pass">
            {t("_inputField.password")}
          </label>
          <input
            className="form-control"
            id="pass"
            placeholder={t("profile.input.newPassword")}
            type={showPassword ? "text" : "password"}
            onChange={(event) => {
              setPassword(event.currentTarget.value);
              updatePassword(event.currentTarget.value, passwordConfirm, showPassword);
            }}
            defaultValue={password}
          />
        </fieldset>
        {!showPassword ? (
          <fieldset className="mb-3">
            <label className="form-label" htmlFor="passConfirm">
              {t("passwordReset.label.confirm", "Confirm")}
            </label>
            <input
              className="form-control"
              id="passConfirm"
              placeholder={t("profile.input.repeatPassword")}
              type="password"
              onChange={(event) => {
                setPasswordConfirm(event.currentTarget.value);
                updatePassword(password, event.currentTarget.value, showPassword);
              }}
              defaultValue={passwordConfirm}
            />
            {passwordSame ? t("resetPassword.message.passwordsSame", "Passwords match") : null}
            {passwordNotSame
              ? t("resetPassword.message.passwordsNotSame", "Passwords don't match")
              : null}
          </fieldset>
        ) : null}

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-save js-reset-pwd"
            disabled={!passwordValid || !!isBusy}
          >
            {t("resetPassword.confirm", "Set my password")}
          </button>
          <ButtonCancel onClick={handelCancel} />
        </div>
      </form>
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("ResetPasswordPage", () => ResetPasswordPage);

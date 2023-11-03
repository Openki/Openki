import React, { useState } from "react";
import { AccountsAsync } from "/imports/utils/promisify";
import { useValidation } from "/imports/ui/lib/useValidation";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";

import { isEmail } from "/imports/utils/email-tools";

import "./styles.scss";

export type Props = {
  email: string;
  onForgotPwd: () => void;
  onClose: () => void;
};

export function ForgotPwdFrame({ email = "", onForgotPwd, onClose }: Props) {
  const { t } = useTranslation();
  const [isBusy, setIsBusy] = useState(false);
  const [forgotPwdData, setForgotPwdData] = useState({ email });
  const [errors, checkValidity] = useValidation({
    noEmail: {
      text: () => t("forgot.notValid", "Please enter the address you signed up with."),
      field: "email",
      onCheckValidity: () => isEmail(forgotPwdData.email),
    },
  });

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setIsBusy(true);

        try {
          await AccountsAsync.forgotPassword({
            email: forgotPwdData.email,
          });

          Alert.success(
            t(
              "forgotPassword.emailSent",
              "An e-mail with further instructions on how to reset your password has been sent to you.",
            ),
          );
          onForgotPwd();
        } catch (err) {
          Alert.serverError(
            err,
            t("forgotPassword.emailSent.error", "We were unable to send a mail to this address"),
          );
        } finally {
          setIsBusy(false);
        }
      }}
    >
      <div className="forgot_login">
        <p>
          {t(
            "forgot.explanation",
            "We will send you an e-mail with a link allowing you to reset your password.",
          )}
        </p>
        <div className="mb-3">
          <div className="input-group">
            <span className="input-group-text">
              <span className="fa-solid fa-envelope"></span>
            </span>
            <input
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              aria-describedby="forgotPwdMailHelp"
              placeholder={t("frame.login.email", "E-Mail")}
              type="email"
              autoFocus={true}
              onChange={(event) => {
                setForgotPwdData({
                  ...forgotPwdData,
                  email: event.target.value,
                });
              }}
            />
          </div>
          {errors.email ? (
            <div id="forgotPwdMailHelp" className="form-text">
              {errors.email}
            </div>
          ) : null}
        </div>
        <div className="mb-3">
          <button
            className="btn btn-save js-reset-pwd-btn form-control"
            disabled={checkValidity() || isBusy}
            type="submit"
          >
            {isBusy ? (
              <>
                {" "}
                <span className="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></span>
                {t("forgot.send.busy", "Resetting password…")}
              </>
            ) : (
              t("forgot.send", "Reset my password")
            )}
          </button>
        </div>
        <div className="mb-3">
          <button
            type="button"
            className="btn btn-cancel form-control"
            onClick={() => {
              onClose();
            }}
          >
            {t("_button.cancel")}
          </button>
        </div>
      </div>
    </form>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("ForgotPwdFrame", () => ForgotPwdFrame);

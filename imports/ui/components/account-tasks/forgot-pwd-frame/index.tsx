import React, { useEffect, useState } from "react";
import { AccountsAsync } from "/imports/utils/promisify";
import { useValidation } from "/imports/ui/lib/useValidation";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";

import * as Alert from "/imports/api/alerts/alert";

import { isEmail } from "/imports/utils/email-tools";

import "./styles.scss";

export interface Props {
  email: string;
  onForgotPwd: () => void;
  onClose: () => void;
}

export function ForgotPwdFrame(props: Props) {
  const { onForgotPwd, onClose } = props;
  const { t } = useTranslation();
  const [isBusy, setIsBusy] = useState(false);
  const [email, setEmail] = useState(props.email);
  const [errors, checkValidity] = useValidation(
    {
      noEmail: {
        text: () => t("forgot.notValid", "Please enter the address you signed up with."),
        field: "email",
        onCheckValidity: () => isEmail(email),
      },
    },
    true,
  );

  useEffect(() => {
    checkValidity();
  }, [email]);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setIsBusy(true);
        try {
          await AccountsAsync.forgotPassword({ email });

          Router.go("home", {}, { query: { action: "resetPasswortEmailSended" } });

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
      <div>
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
              className="form-control"
              aria-describedby="forgotPwdMailHelp"
              placeholder={t("frame.login.email", "E-Mail")}
              type="email"
              autoFocus={true}
              value={email}
              onChange={(event) => {
                setEmail(event.currentTarget.value);
              }}
            />
          </div>
          {!!errors.email && (
            <div id="forgotPwdMailHelp" className="form-text">
              {errors.email}
            </div>
          )}
        </div>
        <div className="mb-3">
          <button
            className="btn btn-save js-reset-pwd-btn form-control"
            disabled={!!errors.email || isBusy}
            type="submit"
          >
            {isBusy ? (
              <>
                <span className="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></span>{" "}
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

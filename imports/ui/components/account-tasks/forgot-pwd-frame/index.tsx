import React, { useState } from "react";
import { AccountsAsync } from "/imports/utils/promisify";
import { useValidation } from "/imports/ui/hooks/useValidation";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";

import * as Alert from "/imports/api/alerts/alert";

import { isEmail } from "/imports/utils/email-tools";

import { FormControl } from "/imports/ui/components/form-control";
import { Button, ButtonCancel } from "/imports/ui/components/Buttons";

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
        isValid: () => isEmail(email),
      },
    },
    { initialCheck: !!props.email, autoCheckFixed: true },
  );

  return (
    <form
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();

        if (!checkValidity()) {
          return;
        }

        setIsBusy(true);
        try {
          await AccountsAsync.forgotPassword({ email });

          Router.go("home", {}, { query: { action: "resetPasswordEmailSent" } });

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
          <FormControl
            id="forgot-pwd-mail"
            type="email"
            prepend="fa-solid fa-envelope"
            label={t("frame.login.email", "E-Mail")}
            // oxlint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            value={email}
            onChange={(value) => setEmail(value)}
            onBlur={() => checkValidity("email")}
            error={errors.email}
          />
        </div>
        <div className="mb-3">
          <Button
            id="reset-pdw-btn"
            block
            submit
            className="btn-save"
            disabled={!!errors.email}
            isBusy={isBusy}
            busyText={t("forgot.send.busy", "Resetting password…")}
          >
            {t("forgot.send", "Reset my password")}
          </Button>
        </div>
        <ButtonCancel id="reset-pdw-cancel-btn" block onClick={() => onClose()} disabled={isBusy} />
      </div>
    </form>
  );
}

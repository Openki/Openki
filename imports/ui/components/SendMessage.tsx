import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";

import { useUser } from "/imports/utils/react-meteor-data";

import { VerifyEmail } from "/imports/ui/components/profiles/VerifyEmail";
import { FormCheck } from "/imports/ui/components/FormCheck";
import { Button } from "/imports/ui/components/Buttons";
import { FormControl } from "/imports/ui/components/form-control";
import { useValidation } from "/imports/ui/lib/useValidation";
import { useAccountTasks } from "/imports/utils/useAccountTasks";

export interface Props {
  autoFocus?: boolean | undefined;
  placeholder: string;
  onSend: (
    message: string,
    options: {
      revealAddress: boolean;
      sendCopy: boolean;
    },
  ) => Promise<void>;
}

export function SendMessage(props: Props) {
  const { t } = useTranslation();
  const user = useUser();
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [revealAddress, setRevealAddress] = useState(false);
  const [sendCopy, setSendCopy] = useState(false);

  const [errors, checkValidity] = useValidation(
    {
      messageTooShort: {
        text: () => t("profile.mail.longertext", "longer text please"),
        field: "message",
        isValid: () => message.length >= 2,
      },
    },
    { autoCheckFixed: true },
  );

  const { promptToLogin } = useAccountTasks();

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
          if (!(await promptToLogin())) {
            return;
          }

          await props.onSend(message, { revealAddress, sendCopy });
          Alert.success(t("profile.mail.sent", "Your message was sent"));
        } catch (err) {
          Alert.serverError(err, t("profile.mail.sendFailed", "Your message was not sent"));
        } finally {
          setIsBusy(false);
        }
        setMessage("");
      }}
    >
      <div className="mb-3">
        <FormControl
          id="send-message-textarea"
          type="textarea"
          rows={7}
          autoFocus={props.autoFocus}
          label={t("profile.mail.message", "Message")}
          placeholder={props.placeholder}
          value={message}
          onChange={(value) => setMessage(value)}
          onBlur={() => message.length && checkValidity("message")}
          error={errors.message}
        />
      </div>
      {user?.hasVerifiedEmail() ? (
        <>
          <FormCheck
            type="box"
            id="send-message-send-copy"
            label={t("profile.mail.copy", "Send me a copy of this message")}
            onChange={(checked) => setSendCopy(checked)}
          />
          <FormCheck
            type="box"
            id="send-message-reveal-address"
            label={t("profile.mail.attachmail", "Attach my e-mail address")}
            onChange={(checked) => setRevealAddress(checked)}
          />
        </>
      ) : (
        !!user && (
          <div className="card mb-3">
            <div className="card-header bg-warning">
              <i className="fa-regular fa-circle-check" />{" "}
              {t("sendMessage.plsVerifyEmail", "Please verify your e-mail address")}
            </div>
            <div className="card-body p-3">
              <p>
                {t(
                  "userprofile.infoForUnverifiedMail",
                  "Verify your e-mail address to receive a copy or to attach it to the message.",
                )}
              </p>
              <VerifyEmail />
            </div>
          </div>
        )
      )}

      <div className="form-actions">
        <Button
          submit
          id="send-message-submit"
          className="btn-save"
          busyText={t("userprofile.sendmail-btn.busy", "Sending e-mail…")}
          isBusy={isBusy}
        >
          <i className="fa-solid fa-paper-plane fa-fw" />
          &nbsp;
          {t("userprofile.sendmail-btn", "Send e-mail")}
        </Button>
      </div>
    </form>
  );
}

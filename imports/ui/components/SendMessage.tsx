import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";

import { useUser } from "/imports/ui/hooks/react-meteor-data";

import { VerifyEmail } from "/imports/ui/components/profiles/VerifyEmail";
import { FormCheck } from "/imports/ui/components/FormCheck";
import { Button } from "/imports/ui/components/Buttons";
import { FormControl } from "/imports/ui/components/form-control";
import { useValidation } from "/imports/ui/hooks/useValidation";
import { useAccountTasks } from "/imports/utils/useAccountTasks";
import { useLocalStorage } from "/imports/ui/hooks/useLocalStorage";

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
  showEmailOptions: boolean;
  /**
   * The ID of the user or event that will receive the message. Used for persisting message drafts.
   */
  recipientId: string;
}

export function SendMessage(props: Props) {
  const showEmailOptions = props.showEmailOptions ?? false;
  const { t } = useTranslation();
  const user = useUser();
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage, resetMessage] = useLocalStorage(
    `SendMessage:${props.recipientId}`,
    "",
  );
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

  const hasVerifiedEmail = user?.hasVerifiedEmail();

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
          resetMessage();
        } catch (err) {
          Alert.serverError(err, t("profile.mail.sendFailed", "Your message was not sent"));
        } finally {
          setIsBusy(false);
        }
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
          disabled={!hasVerifiedEmail}
        />
      </div>
      {hasVerifiedEmail
        ? showEmailOptions && (
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
          )
        : !!user && (
            <div className="card mb-3">
              <div className="card-header bg-warning fw-bold">
                <i className="fa-regular fa-circle-check pe-1" />
                {t("sendMessage.plsVerifyEmail", "Please verify your e-mail address")}
              </div>
              <div className="card-body p-3">
                <p>
                  {t(
                    "userprofile.infoForUnverifiedMail",
                    "Verify your e-mail address to send direct messages.",
                  )}
                </p>
                <VerifyEmail />
              </div>
            </div>
          )}

      <div className="form-actions">
        <Button
          submit
          id="send-message-submit"
          className="btn-save"
          busyText={t("userprofile.sendmail-btn.busy", "Sending e-mail…")}
          isBusy={isBusy}
          disabled={!hasVerifiedEmail}
        >
          <i className="fa-solid fa-paper-plane fa-fw" />
          &nbsp;
          {t("userprofile.sendmail-btn", "Send e-mail")}
        </Button>
      </div>
    </form>
  );
}

import { useTranslation } from "react-i18next";
import React, { useState } from "react";

import * as Alert from "/imports/api/alerts/alert";

import { useUser } from "/imports/utils/react-meteor-data";

import { VerifyEmail } from "/imports/ui/components/profiles/verify-email";
import { PleaseLogin } from "/imports/ui/components/please-login";

import "./styles.scss";

export interface Data {
  placeholder: string;
  onSend: (
    message: string,
    options: {
      revealAddress: boolean;
      sendCopy: boolean;
    },
  ) => Promise<void>;
}

export function SendMessage(props: Data) {
  const { t } = useTranslation();
  const currentUser = useUser();
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [revealAddress, setRevealAddress] = useState(false);
  const [sendCopy, setSendCopy] = useState(false);

  return (
    <PleaseLogin
      type="form"
      onSubmit={async () => {
        setIsBusy(true);

        if (message.length < 2) {
          Alert.error(t("profile.mail.longertext", "longer text please"));
          setIsBusy(false);
          return;
        }

        const options = {
          revealAddress,
          sendCopy,
        };

        try {
          await props.onSend(message, options);
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
        <textarea
          className="form-control send-message-textarea"
          placeholder={props.placeholder}
          autoFocus={true}
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
          }}
        ></textarea>
      </div>
      {currentUser?.hasVerifiedEmail() ? (
        <>
          <div className="form-check">
            <input
              className="form-check-input"
              name="sendCopy"
              type="checkbox"
              value=""
              id="sendMessageSendCopyCheck"
              onChange={(event) => {
                setSendCopy(event.target.checked);
              }}
            />
            <label className="form-check-label" htmlFor="sendMessageSendCopyCheck">
              {t("profile.mail.copy", "Send me a copy of this message")}
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              name="revealAddress"
              type="checkbox"
              value=""
              id="sendMessageRevealAddressCheck"
              onChange={(event) => {
                setRevealAddress(event.target.checked);
              }}
            />
            <label className="form-check-label" htmlFor="sendMessageRevealAddressCheck">
              {t("profile.mail.attachmail", "Attach my e-mail address")}
            </label>
          </div>
        </>
      ) : (
        !!currentUser && (
          <div className="card mb-3">
            <div className="card-header bg-warning">
              <span className="fa-regular fa-circle-check" aria-hidden="true"></span>{" "}
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
        <button type="submit" className="btn btn-save" disabled={isBusy}>
          {isBusy ? (
            <>
              <span className="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></span>
              &nbsp;
              {t("userprofile.sendmail-btn.busy", "Sending e-mail…")}
            </>
          ) : (
            <>
              <span className="fa-solid fa-paper-plane fa-fw" aria-hidden="true"></span>&nbsp;
              {t("userprofile.sendmail-btn", "Send e-mail")}
            </>
          )}
        </button>
      </div>
    </PleaseLogin>
  );
}

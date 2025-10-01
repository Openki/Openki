import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { EventModel } from "/imports/api/events/events";

import { PleaseLogin } from "/imports/ui/components/please-login";

import "./styles.scss";

export interface Props {
  event: EventModel;
  onCancel: (reason: string) => Promise<void>;
  onClose: () => void;
}

export function CancelConfirmDialog({ event, onCancel, onClose }: Props) {
  const { t } = useTranslation();

  const [reason, setReason] = useState("");

  return (
    <div className="event-cancel-confirm">
      <p>
        {t(
          "event.realycancel",
          'Please confirm the cancellation of this event. It will be displayed as "canceled" and registration will not be possible anymore. {NUM, plural, one{If the attending user has automated notifications enabled} other{those of the attending # users that have automated notifications enabled} } will be automatically informed by email about the cancellation of this event.',
          { NUM: event.participants?.length },
        )}
      </p>
      {!!event.participants?.length && (
        <>
          <label className="form-label" htmlFor="event-cancel-message">
            {t("event.cancel.reason", "Reason")}
          </label>
          <div className="mb-3">
            <div className="input-group">
              <span className="input-group-text">
                <span className="fa-solid fa-pencil fa-fw" aria-hidden="true"></span>
              </span>
              <textarea
                rows={3}
                className="form-control"
                id="event-cancel-message"
                maxLength={2000}
                placeholder={t(
                  "event.cancel.reason.placeholder",
                  "Please add a reason here. (This message will be sent to all the registered users and not be visible here afterwards)",
                )}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                }}
              ></textarea>
            </div>
          </div>
        </>
      )}

      <div className="form-actions">
        <PleaseLogin
          type="button"
          className="btn btn-danger text-nowrap"
          onClick={async () => {
            await onCancel(reason);
          }}
          busyText={t("event.canceling", "Canceling...")}
        >
          {t("event.cancel.confirm.button", "Cancel {EVENT}", { EVENT: event.title })}
        </PleaseLogin>
        <button
          type="button"
          className="btn btn-edit"
          onClick={() => {
            onClose();
          }}
        >
          {t("event.details.close", "Close")}
        </button>
      </div>
    </div>
  );
}

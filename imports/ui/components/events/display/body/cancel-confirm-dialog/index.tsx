import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { EventModel } from "/imports/api/events/events";

import "./template.html";
import "./styles.scss";

export function CancelConfirmDialog({
  event,
  onCancel,
}: {
  event: EventModel;
  onCancel: () => Promise<void>;
}) {
  const { t } = useTranslation();

  const [isBusy, setIsBusy] = useState(false);

  return (
    <div className="event-cancel-confirm">
      <p>
        {t(
          "event.reallycancel",
          'Please confirm the cancellation of this event. It will be displayed as "canceled" and {NUM, plural, one{one attending user} other{all attending # users} } will be automatically informed by email about the cancellation of this event.',
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
                className="form-control js-event-cancel-message"
                id="event-cancel-message"
                maxLength={2000}
                placeholder={t('event.cancel.reason.placeholder' ,'Please add a reason here. (This message will be sent to all the registered users and not be visible here afterwards)'}
              ></textarea>
            </div>
          </div>
        </>
      )}

      <div className="form-actions">
        {!isBusy ? (
          <button
            type="button"
            className="btn btn-danger text-nowrap"
            onClick={async () => {
              setIsBusy(true);
              await onCancel();
            }}
          >
            {t("event.cancel.confirm.button", "Cancel {EVENT}", { EVENT: event.title })}
          </button>
        ) : (
          <button type="button" className="btn btn-danger text-nowrap" disabled={true}>
            <span className="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></span>
            {t("event.canceling", "Canceling...")}
          </button>
        )}
        <button type="button" className="btn btn-edit js-cancel-event-close">
          {t("event.details.close", "Close")}
        </button>
      </div>
    </div>
  );
}

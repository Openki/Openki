import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import "./styles.scss";

export interface Props {
  confirmText: string;
  confirmButton: string;
  cancelButton: string;
  onRemove: () => Promise<void>;
  onCancel: () => Promise<void>;
  busyButton: string;
}

export function EventDeleteConfirmDialog(props: Props) {
  const { t } = useTranslation();
  const [isBusy, setIsBusy] = useState(false);

  return (
    <div className="event-delete-confirm-dialog">
      <p>{props.confirmText}</p>
      <div className="form-actions">
        {!isBusy ? (
          <button type="button" className="btn btn-danger text-nowrap js-cancel">
            {props.cancelButton}
          </button>
        ) : (
          <button type="button" className="btn btn-danger text-nowrap" disabled>
            {props.cancelButton}
          </button>
        )}
        {!isBusy ? (
          <button
            type="button"
            className="btn btn-danger text-nowrap"
            onClick={async () => {
              setIsBusy(true);
              await props.onRemove();
            }}
          >
            {props.confirmButton}
          </button>
        ) : (
          <button type="button" className="btn btn-danger text-nowrap" disabled>
            <i className="fa-solid fa-circle-notch fa-spin fa-fw" />
            {props.busyButton}
          </button>
        )}

        <button
          type="button"
          className="btn btn-cancel text-nowrap"
          onClick={async () => {
            await props.onCancel();
          }}
        >
          {t("_button.cancel")}
        </button>
      </div>
    </div>
  );
}

import React, { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

import { cx } from "/imports/utils/cx";

import "./styles.scss";

export function Confirm({
  variant = "danger",
  children,
}: {
  variant?: "danger" | "warning";
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        "border border-5 p-3",
        variant === "warning" ? "border-warning" : "border-danger",
      )}
    >
      {children}
    </div>
  );
}

export function ConfirmText({ children }: { children: ReactNode }) {
  return <p className="fs-5 whitespace-pre-line">{children}</p>;
}
export function ConfirmActions({ children }: { children: ReactNode }) {
  return (
    <div className="d-flex justify-content-end flex-wrap gap-2 flex-column flex-sm-row">
      {children}
    </div>
  );
}

export interface Props {
  confirmText: string;
  confirmButton: string;
  onRemove: () => Promise<void>;
  onCancel: () => Promise<void>;
  busyButton: string;
}

export function DeleteConfirmDialog(props: Props) {
  const { t } = useTranslation();
  const [isBusy, setIsBusy] = useState(false);

  return (
    <div className="delete-confirm-dialog">
      <p>{props.confirmText}</p>
      <div className="form-actions">
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

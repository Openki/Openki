import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { DeleteConfirmDialog } from "/imports/ui/components/delete-confirm-dialog";

export type Props = {
  confirmText: string;
  confirmButton: string;
  onRemove: () => Promise<void>;
  busyButton: string;
};

export function DeleteConfirm(props: Props) {
  const { t } = useTranslation();
  const [isConfirm, setIsConfirm] = useState(false);
  const { confirmText, confirmButton, onRemove, busyButton } = props;

  if (!isConfirm) {
    return (
      <button
        type="button"
        className="btn btn-delete text-nowrap text-danger"
        onClick={() => {
          setIsConfirm(true);
        }}
      >
        {t("_button.delete")}
      </button>
    );
  }
  return (
    <DeleteConfirmDialog
      confirmText={confirmText}
      confirmButton={confirmButton}
      onRemove={onRemove}
      onCancel={async () => {
        setIsConfirm(false);
      }}
      busyButton={busyButton}
    />
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("DeleteConfirm", () => DeleteConfirm);

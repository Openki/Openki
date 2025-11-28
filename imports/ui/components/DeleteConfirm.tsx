import React, { useState } from "react";

import { ButtonDelete } from "./Buttons";
import { DeleteConfirmDialog } from "/imports/ui/components/delete-confirm-dialog";

export interface Props {
  confirmText: string;
  confirmButton: string;
  onRemove: () => Promise<void>;
  busyButton: string;
}

export function DeleteConfirm({ confirmText, confirmButton, onRemove, busyButton }: Props) {
  const [isConfirm, setIsConfirm] = useState(false);

  if (!isConfirm) {
    return (
      <ButtonDelete id="delete-confirm-confirmDelete" onClick={async () => setIsConfirm(true)} />
    );
  }
  return (
    <DeleteConfirmDialog
      confirmText={confirmText}
      confirmButton={confirmButton}
      onRemove={onRemove}
      onCancel={async () => setIsConfirm(false)}
      busyButton={busyButton}
    />
  );
}

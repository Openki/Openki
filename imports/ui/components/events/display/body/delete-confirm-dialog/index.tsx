import React, { useState } from "react";

import { ConfirmDialog } from "/imports/ui/components/delete-confirm-dialog";
import { Button, ButtonCancel } from "/imports/ui/components/Buttons";
import { useTranslation } from "react-i18next";

export interface Props {
  onEventCancel: () => Promise<void>;
  onRemove: () => Promise<void>;
  onCancel: () => Promise<void>;
}

export function EventDeleteConfirmDialog({ onEventCancel, onRemove, onCancel }: Props) {
  const { t } = useTranslation();
  const [isBusy, setIsBusy] = useState(false);

  return (
    <ConfirmDialog
      text={t(
        "event.reallyDelete",
        "Please confirm that you would like to delete this event. This cannot be undone, the event will be permanently deleted and not visible any more. If the event is already shared or published somewhere we strongly recommend to instead only canceling it.",
      )}
    >
      <Button
        id="event-details-confirm-dialog-event-cancel"
        className="btn-warning"
        onClick={onEventCancel}
        disabled={isBusy}
      >
        {t("event.delete.confirm.cancel.button", "Rather mark as canceled")}
      </Button>
      <Button
        id="event-details-confirm-dialog-delete"
        className="btn-danger"
        isBusy={isBusy}
        needsLogin
        onClick={async () => {
          setIsBusy(true);
          await onRemove();
        }}
        busyText={t("event.delete.confirm.button.busy", "Deleting event…")}
      >
        {t("event.delete.confirm.button", "Delete event without notifying anyone")}
      </Button>
      <ButtonCancel id="event-details-confirm-dialog-cancel" disabled={isBusy} onClick={onCancel} />
    </ConfirmDialog>
  );
}

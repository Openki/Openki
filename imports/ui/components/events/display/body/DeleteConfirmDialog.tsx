import React, { useState } from "react";

import { Confirm, ConfirmActions, ConfirmText } from "/imports/ui/components/Confirm";
import { Button, ButtonClose } from "/imports/ui/components/Buttons";
import { useTranslation } from "react-i18next";

export interface Props {
  onCancel: () => Promise<void>;
  onRemove: () => Promise<void>;
  onClose: () => Promise<void>;
}

export function DeleteConfirmDialog({ onCancel, onRemove, onClose }: Props) {
  const { t } = useTranslation();
  const [isBusy, setIsBusy] = useState(false);

  return (
    <Confirm>
      <ConfirmText>
        {t(
          "event.reallyDelete",
          "Please confirm that you would like to delete this event. This cannot be undone, the event will be permanently deleted and not visible any more. If the event is already shared or published somewhere we strongly recommend to instead only canceling it.",
        )}
      </ConfirmText>
      <ConfirmActions>
        <Button
          id="event-details-confirm-dialog-cancel"
          className="btn-warning"
          onClick={onCancel}
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
        <ButtonClose id="event-details-confirm-dialog-close" disabled={isBusy} onClick={onClose} />
      </ConfirmActions>
    </Confirm>
  );
}

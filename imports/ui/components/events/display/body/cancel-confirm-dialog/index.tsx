import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { EventModel } from "/imports/api/events/events";

import { Button, ButtonClose } from "/imports/ui/components/Buttons";
import { Confirm, ConfirmActions, ConfirmText } from "/imports/ui/components/Confirm";
import { FormControl } from "/imports/ui/components/form-control";
import { useUserId } from "/imports/utils/react-meteor-data";

export interface Props {
  event: EventModel;
  onCancel: (reason: string) => Promise<void>;
  onClose: () => void;
}

export function CancelConfirmDialog({ event, onCancel, onClose }: Props) {
  const { t } = useTranslation();
  const userId = useUserId();

  const [reason, setReason] = useState("");

  const numberOfOtherParticipants =
    event.participants?.filter((p) => p.user !== userId).length || 0;

  return (
    <Confirm variant="warning">
      <ConfirmText id="event-confirm-dialog-text">
        {t(
          "event.reallyCancel",
          'Please confirm the cancellation of this event. It will be displayed as "Canceled" and registration will not be possible anymore. {NUM, plural, =0{} other{{NUM, plural, one{If the attending user has automated notifications enabled} other{Those of the attending # users that have automated notifications enabled} } will be automatically informed by email about the cancellation of this event.} }',
          { NUM: numberOfOtherParticipants },
        )}
      </ConfirmText>
      {!!numberOfOtherParticipants && (
        <div className="mb-3">
          <FormControl
            id="event-cancel-message"
            type="textarea"
            prepend="fa-solid fa-pencil"
            rows={3}
            maxLength={2000}
            placeholder={t(
              "event.cancel.reason.placeholder",
              "Please add a reason here. (This message will be sent to all the registered users and not be visible here afterwards)",
            )}
            value={reason}
            onChange={setReason}
            label={t("event.cancel.reason", "Reason")}
          />
        </div>
      )}
      <ConfirmActions>
        <Button
          id="events-cancel-confirm-dialog-cancel"
          needsLogin
          className="btn-danger"
          onClick={async () => await onCancel(reason)}
          busyText={t("event.canceling", "Canceling...")}
        >
          {t("event.cancel.confirm.button", "Cancel {EVENT}", { EVENT: event.title })}
        </Button>
        <ButtonClose id="events-cancel-confirm-dialog-close" onClick={onClose} />
      </ConfirmActions>
    </Confirm>
  );
}

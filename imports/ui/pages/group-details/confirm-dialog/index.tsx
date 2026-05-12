import React from "react";
import { useTranslation } from "react-i18next";

import { GroupModel } from "/imports/api/groups/groups";

import { Button, ButtonCancel } from "../../../components/Buttons";
import { ButtonGroupArchive } from "../button-group-archive";

import "./styles.scss";

export function ConfirmDialog({
  group,
  disabled,
  archiveButton,
  futureEventCount,
  pastEventCount,
  onArchive,
  onDelete,
  onCancel,
}: {
  group: GroupModel;
  disabled?: boolean | undefined;
  futureEventCount?: number | undefined;
  pastEventCount?: number | undefined;
  archiveButton?: boolean | undefined;
  onArchive: () => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();

  const future = futureEventCount ?? 0;
  const past = pastEventCount ?? 0;
  const total = future + past;

  function getDeleteLabel() {
    if (total === 0) {
      return t("group.delete.confirm.buttonZero", 'Delete "{GROUP}"', {
        GROUP: group.name,
      });
    }
    
    if (future > 0 && past > 0) {
      return t(
        "group.delete.confirm.buttonBothPastAndFutureEvents",
        'Delete "{GROUP}", its {PAST} passed and {FUTURE} upcoming events',
        { GROUP: group.name, PAST: past, FUTURE: future },
      );
    }

    if (future > 0) {
      return t(
        "group.delete.confirm.buttonFuture",
        'Delete "{GROUP}" and its {FUTURE} upcoming events',
        { GROUP: group.name, FUTURE: future },
      );
    }

    return t("group.delete.confirm.buttonPast", 'Delete "{GROUP}" and its {PAST} passed events', {
      GROUP: group.name,
      PAST: past,
    });
  }

  return (
    <div className="group-delete-confirm">
      <p>
        {t(
          "group.reallydelete",
          "Please confirm that you would like to delete {GROUP}. This cannot be undone.",
          { GROUP: group.name },
        )}
      </p>
      <div className="form-actions">
        {!!archiveButton && (
          <ButtonGroupArchive
            className="btn-warning"
            disabled={disabled}
            onArchive={async () => onArchive()}
          >
            {t("group.delete.confirm.archiveButton", "Rather archive")}
          </ButtonGroupArchive>
        )}

        <Button
          id="group-details-confirm-dialog-delete"
          className="btn-danger"
          disabled={disabled}
          needsLogin
          onClick={async () => onDelete()}
          busyText={t("_button.deleting")}
        >
          {getDeleteLabel()}
        </Button>
        <ButtonCancel
          id="coures-details-confirm-dialog-cancel"
          disabled={disabled}
          onClick={onCancel}
        />
      </div>
    </div>
  );
}

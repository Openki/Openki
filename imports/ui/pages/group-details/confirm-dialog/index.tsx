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
  onArchive,
  onDelete,
  onCancel,
}: {
  group: GroupModel;
  disabled?: boolean | undefined;
  archiveButton?: boolean | undefined;
  onArchive: () => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();

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
          {t("group.delete.confirm.button", "Delete {GROUP} and its events", {
            GROUP: group.name,
          })}
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

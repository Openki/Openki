import React from "react";
import { useTranslation } from "react-i18next";

import { GroupModel } from "../../../../api/groups/groups";

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
    <div className="course-delete-confirm">
      <p>
        {t(
          "course.reallydelete",
          "Please confirm that you would like to delete {COURSE}. This cannot be undone.",
          { COURSE: group.name },
        )}
      </p>
      <div className="form-actions">
        {!!archiveButton && (
          <ButtonGroupArchive
            className="btn-warning"
            disabled={disabled}
            onArchive={async () => onArchive()}
          >
            {t("course.delete.confirm.archiveButton", "Rather archive")}
          </ButtonGroupArchive>
        )}

        <Button
          id="coures-details-confirm-dialog-delete"
          className="btn-danger"
          disabled={disabled}
          needsLogin
          onClick={async () => onDelete()}
          busyText={t("_button.deleting")}
        >
          {t("course.delete.confirm.button", "Delete {COURSE} and its events", {
            COURSE: group.name,
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

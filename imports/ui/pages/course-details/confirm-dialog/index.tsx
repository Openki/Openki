import React from "react";
import { useTranslation } from "react-i18next";

import { CourseModel } from "/imports/api/courses/courses";

import { Button, ButtonCancel } from "../../../components/Buttons.old";
import { ButtonCourseArchive } from "../button-course-archive";

import "./styles.scss";

export function ConfirmDialog({
  course,
  disabled,
  archiveButton,
  onArchive,
  onDelete,
  onCancel,
}: {
  course: CourseModel;
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
          { COURSE: course.name },
        )}
      </p>
      <div className="form-actions">
        {!!archiveButton && (
          <ButtonCourseArchive
            className="btn-warning"
            disabled={disabled}
            onArchive={async () => onArchive()}
          >
            {t("course.delete.confirm.archiveButton", "Rather archive")}
          </ButtonCourseArchive>
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
            COURSE: course.name,
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

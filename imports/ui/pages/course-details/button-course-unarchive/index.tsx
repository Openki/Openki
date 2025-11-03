import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../components/Buttons";

export function ButtonCourseUnarchive({
  disabled,
  onUnarchive,
}: {
  disabled?: boolean | undefined;
  onUnarchive: () => Promise<void>;
}) {
  const { t } = useTranslation();

  return (
    <Button
      id="course-details-co"
      disabled={disabled}
      className="btn-primary"
      needsLogin
      onClick={onUnarchive}
      busyText={t("course.archive.unarchiveButton.unarchiving", "Unarchiving…")}
    >
      {t("course.archive.unarchiveButton", "Unarchive")}
    </Button>
  );
}

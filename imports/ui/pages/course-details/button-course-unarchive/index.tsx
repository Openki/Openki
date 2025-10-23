import React from "react";
import { useTranslation } from "react-i18next";
import { ActionButton } from "../../../components/Buttons";

export function ButtonCourseUnarchive({
  disabled,
  onUnarchive,
}: {
  disabled?: boolean | undefined;
  onUnarchive: () => Promise<void>;
}) {
  const { t } = useTranslation();

  return (
    <ActionButton
      disabled={disabled}
      className="btn btn-go"
      needsLogin
      onClick={onUnarchive}
      busyText={t("course.archive.unarchiveButton.unarchiving", "Unarchiving…")}
    >
      {t("course.archive.unarchiveButton", "Unarchive")}
    </ActionButton>
  );
}

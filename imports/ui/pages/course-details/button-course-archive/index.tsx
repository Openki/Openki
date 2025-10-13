import React from "react";
import { useTranslation } from "react-i18next";
import { ActionButton } from "/imports/ui/components/buttons";

export function ButtonCourseArchive({
  className,
  disabled,
  onArchive,
  children,
}: {
  className: string;
  disabled?: boolean | undefined;
  onArchive: () => Promise<void>;
  children: any;
}) {
  const { t } = useTranslation();

  return (
    <ActionButton
      className={`btn ${className}`}
      disabled={disabled}
      needsLogin
      onClick={onArchive}
      busyText={t("course.archive.archiveButton.archiving", "Archiving…")}
    >
      {children}
    </ActionButton>
  );
}

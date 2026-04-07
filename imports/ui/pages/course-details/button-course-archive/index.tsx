import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "../../../components/Buttons";

export function ButtonGroupArchive({
  className,
  disabled,
  onArchive,
  children,
}: {
  className: string;
  disabled?: boolean | undefined;
  onArchive: () => Promise<void>;
  children: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <Button
      id="course-details-course-archive"
      className={`${className}`}
      disabled={disabled}
      needsLogin
      onClick={onArchive}
      busyText={t("course.archive.archiveButton.archiving", "Archiving…")}
    >
      {children}
    </Button>
  );
}

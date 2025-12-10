import React from "react";
import { useTranslation } from "react-i18next";
import { useDetails } from "../../../../api/organizations/publications";

export function GroupHeader({ groupId }: { groupId: string }) {
  const { t } = useTranslation();
  const [groupIsLoading, group] = useDetails(groupId);

  return (
    <>
      {t("course.edit.proposeInGroup", "Propose new course in group {GROUP}", {
        GROUP: groupIsLoading() ? "..." : group?.name,
      })}
    </>
  );
}

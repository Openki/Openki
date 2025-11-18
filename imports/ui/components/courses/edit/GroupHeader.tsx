import React from "react";
import { useTranslation } from "react-i18next";
import { useDetails } from "/imports/api/groups/publications";

export function GroupHeader({ groupId }: { groupId: string }) {
  const { t } = useTranslation();
  const [groupIsLoading, group] = useDetails(groupId);

  if (groupIsLoading()) {
    return null;
  }

  return (
    <>
      {t("course.edit.proposeInGroup", "Propose new course in group {GROUP}", {
        GROUP: group?.name,
      })}
    </>
  );
}

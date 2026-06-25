import React from "react";
import { useTranslation } from "react-i18next";
import { useDetails } from "/imports/api/groups/publications";
import { useUser } from "/imports/utils/react-meteor-data";
import { useLocalizedSetting } from "/imports/utils/getLocalizedValue";

export function CustomFieldDisplay({
  groupId,
  customClassName,
}: {
  groupId: string;
  customClassName?: string | undefined;
}) {
  const { t } = useTranslation();
  const { getLocalizedValue } = useLocalizedSetting();
  const [isLoading, group] = useDetails(groupId);
  const user = useUser();

  if (isLoading() || !group) {
    return null;
  }

  const isEditor = user && group.editableBy(user);

  const customFields =
    group.customFields
      ?.filter((i) => i.visibleFor === "all" || (i.visibleFor === "editors" && isEditor))
      .map((i) => {
        const isboolean = typeof i.value === "boolean";

        let displayValue;

        if (isboolean) {
          displayValue = i.value
            ? t("customField.boolean.yes", "Yes")
            : t("customField.boolean.no", "No");
        } else {
          displayValue = getLocalizedValue(i.displayValue) || i.value;
        }

        return {
          displayText: getLocalizedValue(i.displayText),
          displayValue,
        };
      }) || [];

  return (
    <>
      {customFields.map((info, index) => (
        <p className={customClassName} key={index}>
          <strong>{info.displayText}</strong>:{" "}
          <span className="whitespace-pre-line">{info.displayValue}</span>
        </p>
      ))}
    </>
  );
}

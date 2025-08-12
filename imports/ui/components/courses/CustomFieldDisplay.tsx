import React from "react";
import { useTranslation } from "react-i18next";
import { useDetails } from "/imports/api/courses/publications";
import { getLocalizedValue } from "/imports/utils/getLocalizedValue";
import { useUser } from "/imports/utils/react-meteor-data";

export function CustomFieldDisplay({
  courseId,
  customClassName,
}: {
  courseId: string;
  customClassName?: string | undefined;
}) {
  const { t } = useTranslation();
  const [isLoading, course] = useDetails(courseId);
  const user = useUser();

  if (isLoading() || !course) {
    return null;
  }

  const isEditor = user && course.editableBy(user);

  const customFields =
    course.customFields
      ?.filter((i) => i.visibleFor === "all" || (i.visibleFor === "editors" && isEditor))
      .map((i) => ({
        displayText: getLocalizedValue(i.displayText),
        isboolean: typeof i.value === "boolean",
        value: i.value,
      })) || [];

  return (
    <>
      {customFields.map((info, index) => (
        <p className={customClassName} key={index}>
          <strong>{info.displayText}</strong>:{" "}
          {!info.isboolean ? (
            <span className="pre-line">{info.value}</span>
          ) : info.value ? (
            t("customField.boolean.yes", "Yes")
          ) : (
            t("customField.boolean.no", "No")
          )}
        </p>
      ))}
    </>
  );
}

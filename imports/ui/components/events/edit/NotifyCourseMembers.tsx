import React from "react";
import { useTranslation } from "react-i18next";
import { useDetails as useCourseDetails } from "/imports/api/courses/publications";

export function NotifyCourseMembers({
  courseId,
  isNew,
  notifyChecked,
  onChange,
}: {
  courseId: string;
  isNew: boolean;
  notifyChecked: boolean;
  onChange: (newValue: boolean) => void;
}) {
  const { t } = useTranslation();

  const [isLoading, course] = useCourseDetails(courseId);

  if (isLoading()) {
    return null;
  }

  return (
    <div className="form-check">
      <input
        className="form-check-input"
        type="checkbox"
        value=""
        id="eventEditCheckNotifyCheck"
        checked={notifyChecked}
        onChange={(ev) => {
          onChange(ev.currentTarget.checked);
        }}
      />
      <label className="form-check-label" htmlFor="eventEditCheckNotifyCheck">
        {isNew
          ? t(
              "event.edit.notifyNewEvent",
              'Send notification to all members of the "{COURSE}" course about this event.',
              { COURSE: course?.name || "..." },
            )
          : t(
              "event.edit.notifyEditEvent",
              'Send notification to all interested and participants of the "{COURSE}" course about the changes you made.',
              { COURSE: course?.name || "..." },
            )}
      </label>
    </div>
  );
}

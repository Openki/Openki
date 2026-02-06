import { uniq } from "lodash-es";
import React from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import { useDetails as useCourseDetails } from "/imports/api/courses/publications";

import { FormControl } from "../form-control";
import { FormCheck } from "../FormCheck";
import { EventEditData } from "./edit";

function CourseMembers({
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
    <FormCheck
      id="event-edit-notify-check"
      type="box"
      checked={notifyChecked}
      onChange={onChange}
      label={
        isNew
          ? t(
              "event.edit.notifyNewEvent",
              'Send notification to all members of the "{COURSE}" course about this event.',
              { COURSE: course?.name || "..." },
            )
          : t(
              "event.edit.notifyEditEvent",
              'Send notification to all interested and participants of "{COURSE}" with the up-to-date event information.',
              { COURSE: course?.name || "..." },
            )
      }
    />
  );
}

export function Notify({
  event,
  isNew,
  checked,
  message,
  onToggle,
  onMessageChange,
}: {
  event: EventEditData;
  isNew: boolean;
  checked: boolean;
  message: string;
  onToggle: (value: boolean) => void;
  onMessageChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const user = useUser();

  const [isCourseLoading, course] = useCourseDetails(event.courseId || "");

  function showAddMessage() {
    return [...(course?.members || []), ...(event.participants || [])].length > 0;
  }

  function onlyYouReceive() {
    if (!user) {
      throw new Error(`unexpected falsy: ${user}`);
    }

    const involved = uniq(
      [...(course?.members || []), ...(event.participants || [])].map((m) => m.user),
    );

    return involved.length === 1 && involved.includes(user._id);
  }

  if (isCourseLoading() || !showAddMessage()) {
    return null;
  }

  return (
    <>
      {!!event.courseId && (
        <CourseMembers
          courseId={event.courseId}
          isNew={isNew}
          notifyChecked={checked}
          onChange={onToggle}
        />
      )}
      {checked && (
        <div className="form-switch-text-indent">
          {!onlyYouReceive() ? (
            <FormControl
              id="event-edit-notify-message"
              type="textarea"
              rows={3}
              label={t("course.event.edit.AddMessage", "Add message")}
              optional
              prepend="fa-solid fa-pencil fa-fw"
              placeholder={
                isNew
                  ? t(
                      "event.create.additionalMessage",
                      "e.g. doodle result is Thursday next week. Looking forward to see you all there. Don't forget to register if you join. (This message is only sent to the involved users and will not be visible in the event description afterwards.)",
                    )
                  : t(
                      "event.edit.additionalMessage",
                      "e.g. I had to change the time to 5pm because of room availabilities. I added bringing your own laptop is mandatory in the description. Lookin forward to see you all there. (This message is only sent to the involved users and will not be visible in the event description afterwards.)",
                    )
              }
              value={message}
              maxLength={2000}
              onChange={onMessageChange}
            />
          ) : (
            <div className="form-text">
              {t("course.event.edit.onlyYouReceive", "Only you will receive this notification.")}
            </div>
          )}
        </div>
      )}
    </>
  );
}

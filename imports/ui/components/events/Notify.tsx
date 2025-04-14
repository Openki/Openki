import React from "react";
import { useTranslation } from "react-i18next";
import { useDetails as useCourseDetails } from "/imports/api/courses/publications";
import { EventEditData } from "./edit";
import { useUser } from "/imports/utils/react-meteor-data";

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
              'Send notification to all interested and participants of "{COURSE}" with the up-to-date event information.',
              { COURSE: course?.name || "..." },
            )}
      </label>
    </div>
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

    const involved = [...(course?.members || []), ...(event.participants || [])].map((m) => m.user);

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
          onChange={(newValue) => {
            onToggle(newValue);
          }}
        />
      )}
      {checked &&
        (!onlyYouReceive() ? (
          <>
            <label className="form-label">
              {t("course.event.edit.AddMessage", "Add message")}
              <small> {t("_inputField.optional")}</small>
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <span className="fa-solid fa-pencil fa-fw" aria-hidden="true"></span>
              </span>
              <textarea
                rows={3}
                className="form-control"
                maxLength={2000}
                placeholder={
                  "new" in event
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
                onChange={(ev) => {
                  onMessageChange(ev.currentTarget.value);
                }}
              ></textarea>
            </div>
          </>
        ) : (
          <span className="form-text d-block ms-4">
            {t("course.event.edit.onlyYouReceive", "Only you will receive this notification.")}
          </span>
        ))}
    </>
  );
}

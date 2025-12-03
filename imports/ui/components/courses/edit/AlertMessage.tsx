import { Router } from "meteor/iron:router";
import React from "react";
import { useTranslation } from "react-i18next";
import { useDetails as useCoursesDetails } from "/imports/api/courses/publications";
import { useSiteName } from "/imports/utils/getSiteName";

export function AlertMessage({
  isFrame,
  savedCourseId,
  onClose,
}: {
  isFrame?: boolean | undefined;
  savedCourseId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const siteName = useSiteName();
  const [savedCourseIsLoading, savedCourse] = useCoursesDetails(savedCourseId);

  function savedCourseLink() {
    if (isFrame) {
      const course = savedCourse;
      if (course) {
        return Router.url("showCourse", course);
      }
    }
    return "";
  }
  function savedCourseName() {
    if (isFrame) {
      const course = savedCourse;
      if (course) {
        return course.name;
      }
    }
    return false;
  }

  if (savedCourseIsLoading()) {
    return null;
  }

  return (
    <div className="alert alert-success alert-dismissible fade show" role="alert">
      <h4>
        <i className="fa-solid fa-check" />{" "}
        {t("course.edit.savedMessage", "Your proposal has been saved!")}
      </h4>
      <span className="pre-line">
        {t("course.edit.linkToCourse", 'You can see your new proposal "{NAME}" on {SITENAME}', {
          NAME: (
            <a className="alert-link" href={savedCourseLink()} target="_blank" rel="noreferrer">
              {savedCourseName()}
            </a>
          ),
          SITENAME: siteName,
        })}
      </span>
      <button
        type="button"
        className="btn-close btn-close-black"
        data-bs-dismiss="alert"
        aria-label={t("_button.close")}
        onClick={onClose}
      ></button>
    </div>
  );
}

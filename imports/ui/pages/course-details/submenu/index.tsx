import React, { useEffect, useRef, useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import { CourseModel } from "/imports/api/courses/courses";

import { getLocalizedValue } from "/imports/utils/getLocalizedValue";

import { Description } from "../description";
import { History } from "/imports/ui/components/courses/history";
import { Files } from "/imports/ui/components/courses/files";
import { PricePolicy } from "/imports/ui/components/price-policy";

import "./styles.scss";

export function Submenu(data: { edit: boolean; course: CourseModel; select: string }) {
  const { t } = useTranslation();
  const user = useUser();
  const [descriptionTruncated, setDescriptionTruncated] = useState(true);
  const elementRef = useRef<HTMLDivElement>(null);

  function mayEdit() {
    const { course } = data;
    return course?.editableBy(Meteor.user());
  }
  function customFields() {
    const { course } = data;

    const isEditor = user && course.editableBy(user);

    return (
      course.customFields
        ?.filter((i) => i.visibleFor === "all" || (i.visibleFor === "editors" && isEditor))
        .map((i) => ({
          displayText: getLocalizedValue(i.displayText),
          isboolean: typeof i.value === "boolean",
          value: i.value,
        })) || []
    );
  }

  useEffect(() => {
    // function to check if the description is longer than the div that displays it
    if (elementRef.current) {
      setDescriptionTruncated(elementRef.current.scrollHeight > elementRef.current.clientHeight);
    }
  }, []);

  return (
    <>
      <nav className="course-details-nav">
        <ul className="nav nav-tabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className="nav-link active"
              id="description-tab"
              data-bs-toggle="tab"
              data-bs-target="#description"
              type="button"
              role="tab"
              aria-controls="description"
              aria-selected="true"
            >
              <span className="fa-solid fa-file-lines fa-fw" aria-hidden="true"></span>{" "}
              <span className="tab-label">{t("course.subnav.descr", "Description")}</span>
            </button>
          </li>
          {mayEdit() && (
            <li className="nav-item" role="presentation">
              <button
                className="nav-link"
                id="files-tab"
                data-bs-toggle="tab"
                data-bs-target="#files"
                type="button"
                role="tab"
                aria-controls="files"
                aria-selected="false"
              >
                <span className="fa-solid fa-file fa-fw" aria-hidden="true"></span>{" "}
                <span className="tab-label">{t("course.subnav.files", "Files")}</span>
              </button>
            </li>
          )}
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="history-tab"
              data-bs-toggle="tab"
              data-bs-target="#history"
              type="button"
              role="tab"
              aria-controls="history"
              aria-selected="false"
            >
              <span className="fa-solid fa-clock-rotate-left fa-fw" aria-hidden="true"></span>{" "}
              <span className="tab-label">{t("course.subnav.history", "History")}</span>
            </button>
          </li>
        </ul>
      </nav>
      <div className="tab-content course-details-content">
        <div
          className={`tab-pane ${!descriptionTruncated ? "mh-none overflow-visible" : "overflow-hidden"} active`}
          id="description"
          role="tabpanel"
          aria-labelledby="description-tab"
          tabIndex={0}
        >
          <div className="course-description-fade-wrap">
            <div
              className={`course-description ${!descriptionTruncated ? "mh-none overflow-visible" : "overflow-hidden"} `}
              ref={elementRef}
            >
              <Description
                course={data.course}
                onStartEditing={() => {
                  // sets the state when the user starts editing
                  setDescriptionTruncated(false);
                }}
              />
              {customFields().map((info, index) => (
                <p key={index}>
                  <strong>{info.displayText}</strong>:
                  {!info.isboolean ? (
                    <span className="pre-line">{info.value}</span>
                  ) : info.value ? (
                    t("customField.boolean.yes", "Yes")
                  ) : (
                    t("customField.boolean.no", "No")
                  )}
                </p>
              ))}
            </div>
            {descriptionTruncated && <div className="course-description-fade-bottom"></div>}
          </div>
          {descriptionTruncated && (
            <div
              role="button"
              className="link-primary text-center"
              onClick={() => {
                setDescriptionTruncated(false);
              }}
            >
              — {t("courseDetails.showMore", "show more")} —
            </div>
          )}
        </div>
        <div
          className="tab-pane course-history"
          id="history"
          role="tabpanel"
          aria-labelledby="history-tab"
          tabIndex={0}
        >
          <History course={data.course} />
        </div>
        {mayEdit() && (
          <div
            className="tab-pane mh-none"
            id="files"
            role="tabpanel"
            aria-labelledby="files-tab"
            tabIndex={0}
          >
            <Files course={data.course} />
          </div>
        )}
        {!data.course.isPrivate() && <PricePolicy dismissable wrap="course-details-price-policy" />}
      </div>
    </>
  );
}

// for Blaze
import "./template.html";
Template.registerHelper("CourseDetailsSubmenu", () => Submenu);

import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import { CourseModel } from "/imports/api/courses/courses";

import { Description } from "../description";
import { History } from "/imports/ui/components/courses/history";
import { Files } from "/imports/ui/components/courses/Files";
import { PricePolicy } from "/imports/ui/components/price-policy";
import { CustomFieldDisplay } from "/imports/ui/components/courses/CustomFieldDisplay";

import "./styles.scss";

export function Submenu({ course }: { course: CourseModel }) {
  const { t } = useTranslation();
  const user = useUser();
  const [descriptionTruncated, setDescriptionTruncated] = useState(true);
  const elementRef = useRef<HTMLDivElement>(null);

  function mayEdit() {
    return course.editableBy(user);
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
              <i className="fa-solid fa-file-lines fa-fw" />{" "}
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
                <i className="fa-solid fa-file fa-fw" />{" "}
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
              <i className="fa-solid fa-clock-rotate-left fa-fw" />{" "}
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
                course={course}
                onStartEditing={() => {
                  // sets the state when the user starts editing
                  setDescriptionTruncated(false);
                }}
              />
              <CustomFieldDisplay courseId={course._id} />
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
          <History course={course} />
        </div>
        {mayEdit() && (
          <div
            className="tab-pane mh-none"
            id="files"
            role="tabpanel"
            aria-labelledby="files-tab"
            tabIndex={0}
          >
            <Files course={course} />
          </div>
        )}
        {!course.isPrivate() && <PricePolicy dismissable wrap="course-details-price-policy" />}
      </div>
    </>
  );
}

// for Blaze
import "./template.html";
Template.registerHelper("CourseDetailsSubmenu", () => Submenu);

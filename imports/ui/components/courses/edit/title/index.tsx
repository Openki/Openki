import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { _ } from "meteor/underscore";
import { useCurrentRegionId } from "/imports/utils/useCurrentRegion";
import { Dropdown } from "bootstrap";
import { useFindFilter } from "/imports/api/courses/publications";

import "./styles.scss";
import { Router } from "meteor/iron:router";

export function Title(data: { name: string }) {
  const { t } = useTranslation();

  const [proposedSearch, setProposedSearch] = useState(data.name || "");
  const [focused, setFocused] = useState(false);

  const titleElement = useRef<HTMLInputElement>(null);
  const dropdownElement = useRef<HTMLDivElement>(null);

  const region = useCurrentRegionId();
  const [isLoading, courses] = useFindFilter(
    proposedSearch ? { search: proposedSearch, region: region || "all" } :
    
    { tenants: ["-1"] },
    20,
    undefined,
    [["name", "asc"]],
  );

  const dropdownVisible = () => focused && proposedSearch.length > 3;

  function proposedCourses() {
    if (dropdownVisible()) {
      return courses;
    }
    return [];
  }

  useEffect(() => {
    if (!focused) return;

    if (!dropdownElement.current?.classList.contains("open")) {
      if (titleElement.current) {
        new Dropdown(titleElement.current).toggle();
      }
    }
  });

  return (
    <div className="mb-3 js-proposed-search">
      <label className="form-label">{t("course.edit.title", "Title")}</label>
      <div className="dropdown" ref={dropdownElement}>
        <input
          className="form-control form-control-lg dropdown-toggle js-title"
          ref={titleElement}
          id="editform_name"
          placeholder={t("course.title.placeholder", "What are you interested in?")}
          size={40}
          type="text"
          data-bs-toggle="dropdown"
          defaultValue={proposedSearch}
          onKeyDown={(event) => {
            if (event.key === "9") {
              if (titleElement.current) {
                new Dropdown(titleElement.current).toggle();
              }
              setFocused(false);
            }
          }}
          onInput={_.debounce((event: any) => {
            setProposedSearch(event.target.value);
          }, 220)}
          onFocus={() => {
            setFocused(true);
          }}
        />
        <ul
          className={`dropdown-menu proposed-courses js-proposed-courses ${
            isLoading() || (!isLoading() && !proposedCourses().length) ? "d-none" : ""
          }`}
          role="menu"
          aria-labelledby="editform_name"
          onBlur={(event) => {
            if ($(event.relatedTarget as any).closest(".js-proposed-search").length === 0) {
              setFocused(false);
            }
          }}
        >
          {!isLoading() && proposedCourses().length ? (
            <>
              <li className="dropdown-header">
                <i className="fa-solid fa-info-circle" aria-hidden="true"></i>
                {t(
                  "proposedCoursesDropdown.joinExistingCourseQuestion",
                  "Maybe you would like to join an existing course?",
                )}
                <button type="button" className="btn btn-close"></button>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              {proposedCourses().map((course) => (
                <li
                  key={course._id}
                  className="dropdown-entryprerender"
                  role="presentation"
                  onKeyDown={(event) => {
                    if (event.key === "9" && !event.shiftKey) {
                      if (titleElement.current) {
                        new Dropdown(titleElement.current).toggle();
                      }
                    }
                  }}
                >
                  <a
                    className="dropdown-item"
                    href={Router.path("showCourse", course)}
                    role="menuitem"
                    tabIndex={-1}
                  >
                    {course.name}
                  </a>
                </li>
              ))}
            </>
          ) : null}

          <button type="button" className="btn btn-cancel js-close-btn close-dropdown-button">
            {t("button.proposedCourses.close", "No thanks")}
          </button>
        </ul>
      </div>
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("CourseTitle", () => Title);

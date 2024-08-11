import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { _ } from "meteor/underscore";
import { useCurrentRegionId } from "/imports/utils/useCurrentRegion";
import { Dropdown } from "bootstrap";
import { useFindFilter } from "/imports/api/courses/publications";

import "./styles.scss";
import { Router } from "meteor/iron:router";

function Courses({
  search,
  onResult,
  onClose,
}: {
  search: string;
  onResult: (hasResults: boolean) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const region = useCurrentRegionId();
  const [isLoading, courses] = useFindFilter({ search, region: region || "all" }, 20, undefined, [
    ["name", "asc"],
  ]);

  useEffect(() => {
    onResult(!isLoading() && courses.length > 0);
  });

  return !isLoading() && courses.length ? (
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
      {courses.map((course) => (
        <li
          key={course._id}
          className="dropdown-entryprerender"
          role="presentation"
          onKeyDown={(event) => {
            if (event.key === "9" && !event.shiftKey) {
              onClose();
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
  ) : null;
}

export function Title(data: { name: string }) {
  const { t } = useTranslation();

  const [proposedSearch, setProposedSearch] = useState(data.name || "");
  const [focused, setFocused] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  const titleElement = useRef<HTMLInputElement>(null);
  const dropdownElement = useRef<HTMLDivElement>(null);

  function dropdownVisible() {
    return focused && proposedSearch.length > 3;
  }

  useEffect(() => {
    if (!titleElement.current) {
      return;
    }
    if (dropdownVisible()) {
      Dropdown.getOrCreateInstance(titleElement.current).show();
    } else {
      Dropdown.getOrCreateInstance(titleElement.current).dispose();
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
          defaultValue={proposedSearch}
          data-bs-toggle="dropdown"
          onKeyDown={(event) => {
            if (event.key === "9") {
              if (titleElement.current) {
                Dropdown.getOrCreateInstance(titleElement.current).dispose();
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
            !dropdownVisible() || !hasResults ? "d-none" : ""
          }`}
          role="menu"
          aria-labelledby="editform_name"
          onBlur={(event) => {
            if ($(event.relatedTarget as any).closest(".js-proposed-search").length === 0) {
              setFocused(false);
            }
          }}
        >
          {dropdownVisible() ? (
            <Courses
              search={proposedSearch}
              onResult={(newHasResults) => {
                setHasResults(newHasResults);
              }}
              onClose={() => {
                if (titleElement.current) {
                  Dropdown.getOrCreateInstance(titleElement.current).dispose();
                }
              }}
            />
          ) : null}{" "}
          <button
            type="button"
            className="btn btn-cancel close-dropdown-button"
            onClick={() => {
              if (titleElement.current) {
                Dropdown.getOrCreateInstance(titleElement.current).dispose();
              }
            }}
          >
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
import { use } from "chai";

Template.registerHelper("CourseTitle", () => Title);

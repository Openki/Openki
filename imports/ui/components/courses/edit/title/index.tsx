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
        <button
          type="button"
          className="btn btn-close"
          onClick={() => {
            onClose();
          }}
        ></button>
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
            if (event.key === "Tab" && !event.shiftKey) {
              onClose();
            }
          }}
        >
          <a
            className="dropdown-item js-dropdown-item"
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

export function Title(data: { value?: string | undefined; onChange: (newValue: string) => void }) {
  const { t } = useTranslation();

  const [proposedSearch, setProposedSearch] = useState(data?.value || "");
  const [value, setValue] = useState(data?.value || "");
  const [focused, setFocused] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  const titleElement = useRef<HTMLInputElement>(null);

  function dropdownVisible() {
    return focused && proposedSearch.length > 3;
  }

  useEffect(() => {
    setProposedSearch(data?.value || "");
    setValue(data?.value || "");
    console.info("b");
  }, [data.value]);

  useEffect(() => {
    if (!titleElement.current) {
      return;
    }
    const dropdown = Dropdown.getOrCreateInstance(titleElement.current);
    if (dropdownVisible()) {
      dropdown.show();
    } else {
      dropdown.dispose();
    }
  });

  return (
    <div className="mb-3 js-proposed-search">
      <label className="form-label">{t("course.edit.title", "Title")}</label>
      <div className="dropdown">
        <input
          className="form-control form-control-lg dropdown-toggle js-title"
          ref={titleElement}
          id="editform_name"
          placeholder={t("course.title.placeholder", "What are you interested in?")}
          size={40}
          type="text"
          value={value}
          data-bs-toggle="dropdown"
          data-bs-auto-close="false"
          onKeyDown={(event) => {
            if (event.key === "Tab") {
              if (titleElement.current) {
                Dropdown.getOrCreateInstance(titleElement.current).dispose();
              }
              setFocused(false);
            } else if (event.key === "ArrowDown") {
              (
                titleElement.current?.parentElement?.querySelector(
                  ".js-dropdown-item",
                ) as HTMLAnchorElement
              ).focus();
            } else if (event.key === "ArrowUp") {
              const elements = titleElement.current?.parentElement?.querySelectorAll(
                ".js-dropdown-item",
              ) as NodeListOf<HTMLAnchorElement>;

              elements.item(elements.length - 1).focus();
            }
          }}
          onChange={(event) => {
            setValue(event.target.value);
            data.onChange(event.target.value);
          }}
          onInput={_.debounce((event: any) => {
            setProposedSearch(event.target.value);
          }, 220)}
          onFocus={() => {
            setFocused(true);
          }}
        />
        <ul
          className={`dropdown-menu proposed-courses ${
            !dropdownVisible() || !hasResults ? "d-none" : ""
          }`}
          role="menu"
          aria-labelledby="editform_name"
        >
          {dropdownVisible() ? (
            <Courses
              search={proposedSearch}
              onResult={(newHasResults) => {
                setHasResults(newHasResults);
              }}
              onClose={() => {
                setFocused(false);
              }}
            />
          ) : null}
          <button
            type="button"
            className="btn btn-cancel close-dropdown-button"
            onClick={() => {
              setFocused(false);
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

Template.registerHelper("CourseTitle", () => Title);

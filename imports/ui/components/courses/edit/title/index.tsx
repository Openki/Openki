import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCurrentRegionId } from "/imports/utils/useCurrentRegion";
import { useFindFilter } from "/imports/api/courses/publications";

import "./styles.scss";
import { Router } from "meteor/iron:router";
import { debounce } from "lodash";

function Courses({ search }: { search: string }) {
  const { t } = useTranslation();
  const region = useCurrentRegionId();

  const [collapsed, setCollapsed] = useState(false);

  const [isLoading, courses] = useFindFilter({ search, region: region || "all" }, 20, undefined, [
    ["name", "asc"],
  ]);

  return !isLoading() && courses.length ? (
    <div className="list-group proposed-courses mt-3">
      <span className="list-group-item  border-0 border-bottom">
        <h5 className="m-0">
          <button
            type="button"
            className="btn btn-link"
            onClick={() => {
              setCollapsed(!collapsed);
            }}
          >
            {collapsed ? (
              <span className="fa-solid fa-angle-down fa-fw" aria-hidden="true"></span>
            ) : (
              <span className="fa-solid fa-angle-up fa-fw" aria-hidden="true"></span>
            )}
          </button>
          {t(
            "proposedCoursesDropdown.joinExistingCourseQuestion",
            "Maybe you would like to join an existing course?",
          )}
        </h5>
      </span>
      {!collapsed && (
        <>
          {courses.map((course) => (
            <a
              className="list-group-item list-group-item-action border-0"
              key={course._id}
              href={Router.path("showCourse", course)}
            >
              {course.name}
            </a>
          ))}
          <span className="list-group-item text-center border-0 border-top">
            <button
              type="button"
              className="btn btn-cancel"
              onClick={() => {
                setCollapsed(true);
              }}
            >
              {t("button.proposedCourses.close", "No thanks")}
            </button>
          </span>
        </>
      )}
    </div>
  ) : null;
}

export function Title(data: {
  value?: string | undefined;
  showOtherProposals?: boolean | undefined;
  onChange: (newValue: string) => void;
}) {
  const { t } = useTranslation();

  const [proposedSearch, setProposedSearch] = useState(data?.value || "");
  const [value, setValue] = useState(data?.value || "");

  const titleElement = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProposedSearch(data?.value || "");
    setValue(data?.value || "");
  }, [data.value]);

  return (
    <div className="mb-3">
      <label className="form-label">{t("course.edit.title", "Title")}</label>
      <input
        className="form-control form-control-lg js-title"
        ref={titleElement}
        id="editform_name"
        placeholder={t("course.title.placeholder", "What are you interested in?")}
        size={40}
        type="text"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          data.onChange(event.target.value);
        }}
        onInput={debounce((event: any) => {
          setProposedSearch(event.target.value);
        }, 220)}
        autoComplete="off"
      />
      {data.showOtherProposals && proposedSearch.length > 3 && <Courses search={proposedSearch} />}
    </div>
  );
}

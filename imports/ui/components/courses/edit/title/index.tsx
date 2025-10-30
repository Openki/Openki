import { debounce } from "lodash";
import { Router } from "meteor/iron:router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFindFilter } from "/imports/api/courses/publications";
import { useCurrentRegionId } from "/imports/utils/useCurrentRegion";

import { FormControl } from "/imports/ui/components/form-control";

import "./styles.scss";

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

  useEffect(() => {
    setProposedSearch(data?.value || "");
    setValue(data?.value || "");
  }, [data.value]);

  return (
    <div className="mb-3">
      <FormControl
        id="course-edit-title"
        type="text"
        size="large"
        label={t("course.edit.title", "Title")}
        placeholder={t("course.title.placeholder", "What are you interested in?")}
        value={value}
        autoComplete="off"
        onChange={(value) => {
          setValue(value);
          data.onChange(value);
          debounce((value: string) => {
            setProposedSearch(value);
          }, 220)(value);
        }}
      />
      {data.showOtherProposals && proposedSearch.length > 3 && <Courses search={proposedSearch} />}
    </div>
  );
}

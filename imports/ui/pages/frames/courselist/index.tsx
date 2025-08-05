import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "/imports/utils/react-meteor-router";

import { Courses, FindFilter } from "/imports/api/courses/courses";

import * as Metatags from "/imports/utils/metatags";
import { CssFromQuery } from "/imports/ui/lib/css-from-query";
import { SortSpec } from "/imports/utils/sort-spec";

import { LoadingRow } from "../../loading";
import { useFindFilter } from "/imports/api/courses/publications";
import { Course } from "./course";

function useOptions() {
  const query = useSearchParams();

  const filter = Courses.Filtering().read(query);
  const filterQuery: FindFilter = filter.toQuery();
  // Show internal events only when a group is specified
  if (!filterQuery.group && filterQuery.internal === undefined) {
    filterQuery.internal = false;
  }

  const count = Number.parseInt(query.count || "", 10) || 5;

  const sort = query.sort ? SortSpec.fromString(query.sort) : SortSpec.unordered();

  const hideInterested = !!Number.parseInt(query.hideInterested || "", 10) || false;

  const style = new CssFromQuery(query, [
    ["itembg", "background-color", ".frame-list-item"],
    ["itemcolor", "color", ".frame-list-item"],
    ["linkcolor", "color", ".frame-list-item a"],
    ["regionbg", "background-color", ".frame-list-item-region"],
    ["regioncolor", "color", ".frame-list-item-region"],
    ["itemfontweight", "font-weight", ".frame-list-item-header"],
  ]).getCssRules();

  return {
    filter: filterQuery,
    count,
    sort: sort.spec(),
    hideInterested,
    style,
  };
}

export function CourselistPage() {
  const { t } = useTranslation();
  const options = useOptions();
  const [limit, setLimit] = useState(options.count);

  const [isLoading, coursesList] = useFindFilter(
    options.filter,
    limit + 1,
    undefined,
    options.sort,
  );

  Metatags.setCommonTags(t("course.list.windowtitle", "Courses"));

  function courses() {
    return coursesList.slice(0, limit);
  }
  function moreCourses() {
    return coursesList.length > limit;
  }

  return (
    <>
      <style>{options.style.map((rule) => rule)}</style>
      {courses().length === 0 && (
        <h2 className="mt-5 text-center">
          {t("frame.courselist.empty", "There is nothing here yet")}
        </h2>
      )}
      {courses().map((course) => (
        <Course key={course._id} course={course} hideInterested={options.hideInterested} />
      ))}
      {isLoading() && <LoadingRow />}
      {moreCourses() && (
        <div className="mt-2 text-center">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              setLimit(limit + 5);
            }}
          >
            {t("_button.more")}
          </button>
        </div>
      )}
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("CourselistPage", () => CourselistPage);

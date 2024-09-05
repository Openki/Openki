import React, {  useEffect, useState } from "react";
import { Router } from "meteor/iron:router";

import { Courses } from "/imports/api/courses/courses";

import * as UrlTools from "/imports/utils/url-tools";
import * as Tooltips from "/imports/utils/Tooltips";

import { CourseTemplate } from "/imports/ui/lib/course-template";
import * as RegionSelection from "/imports/utils/region-selection";
import { FilterPreview } from "/imports/ui/lib/filter-preview";
import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import { ScssVars } from "/imports/ui/lib/scss-vars";
import * as Viewport from "/imports/ui/lib/viewport";

import {
  Filter,
  VisibleFilters,
  type Props as FilterProps,
} from "/imports/ui/components/courses/filter";

import "./template.html";
import "./styles.scss";
import { useTranslation } from "react-i18next";
import { SearchField } from "/imports/ui/components/search-field";
import { CourseList } from "/imports/ui/components/courses/list";
import { Edit } from "/imports/ui/components/courses/edit";
import { useFindFilter } from "/imports/api/courses/publications";
import { LoadingPage } from "/imports/ui/pages/loading";

const hiddenFilters = ["needsRole", "categories"];
const filters = hiddenFilters.concat(["state"]);

export function Find(query: { [key: string]: string }) {
  const { t } = useTranslation();
  const [showingFilters, setShowingFilters] = useState(false);
  const courseBlockSize = 36;
  const [courseLimit, setCourseLimit] = useState(courseBlockSize);
  const filter = Courses.Filtering();

  // Add one to the limit so we know there is more to show
  const [isLoading, courses] = useFindFilter(filter.toQuery(), courseLimit + 1);

  // Reflect filter selection in URI
  // This creates a browser history entry so it is not done on every filter
  // change. For example, when the search-field receives keydowns, the filter
  // is updated but the change is not reflected in the URI.
  function updateUrl() {
    const urlParams = filter.toParams() as {
      [name: string]: string;
    };
    delete urlParams.region; // HACK region is kept in the session (for bad reasons)
    delete urlParams.internal;

    // used to keep scrollpos when navigating back
    if (courseLimit > courseBlockSize) {
      urlParams.coursesAmount = courseLimit.toString();
    }
    const queryString = UrlTools.paramsToQueryString(urlParams);

    const options: { query?: string } = {};

    if (queryString.length) {
      options.query = queryString;
    }

    routerAutoscroll.cancelNext();

    const router = Router.current();
    Router.go(router.route.getName(), { _id: router.params._id }, options);

    return true;
  }

  function searchFieldAttr() {
    return {
      search: filter.get("search"),
      onChange: (newValue: string) => {
        filter.add("search", newValue).done();
      },
      onFocusOut: () => {
        updateUrl();
      },
    };
  }
  function filterAttr(): FilterProps {
    return {
      showingFilters,
      // check if one of the filters indicated as filters is active
      active: VisibleFilters.some((f) => filter.get(f)),
      onToggleFilters: () => {
        if (showingFilters) {
          VisibleFilters.forEach((f) => {
            filter.disable(f);
          });

          filter.done();
          updateUrl();
          setShowingFilters(false);
        } else {
          setShowingFilters(true);
        }
      },
      state: filter.get("state") || [],
      onStateClick: (state) => {
        filter.disable("state").toggle("state", state.name).done();

        updateUrl();
      },
      onStateMouseOver: (state) => {
        if (!filter.get("state")) {
          FilterPreview({
            property: "state",
            id: state.cssClass,
            activate: true,
          });
        }
      },
      onStateMouseOut: (state) => {
        if (!filter.get("state")) {
          FilterPreview({
            property: "state",
            id: state.cssClass,
            activate: false,
          });
        }
      },
      archived: filter.get("archived") || false,
      onArchivedClick: () => {
        filter.toggle("archived").done();
        updateUrl();
      },
      onArchivedMouseOver: () => {
        if (!filter.get("archived")) {
          FilterPreview({
            property: "is",
            id: "archived",
            activate: true,
          });
        }
      },
      onArchivedMouseOut: () => {
        if (!filter.get("archived")) {
          FilterPreview({
            property: "is",
            id: "archived",
            activate: false,
          });
        }
      },
      categories: filter.get("categories") || [],
      onCategoryAdd: (category: string) => {
        filter.add("categories", category).done();
        updateUrl();
      },
      onCategoryRemove: (category: string) => {
        filter.remove("categories", category).done();
        updateUrl();
      },
      needsRole: filter.get("needsRole") || [],
      onNeedsRoleClick: (role) => {
        filter.toggle("needsRole", role).done();
        updateUrl();
      },
      onNeedsRoleMouseOut: (role) => {
        FilterPreview({
          property: "role",
          id: role,
          activate: false,
        });
      },
      onNeedsRoleMouseOver: (role) => {
        FilterPreview({
          property: "role",
          id: role,
          activate: true,
        });
      },
    };
  }

  function newCourse() {
    const course = CourseTemplate();
    course.filter = filter;
    const search = filter.get("search");
    if (search) {
      course.name = search;
    }
    const groupId = filter.get("group");
    if (groupId) {
      course.group = groupId;
    }
    return course;
  }
  function hasResults() {
    return courses.length > 0;
  }
  function hasMore() {
    return courses.length > courseLimit;
  }
  function results() {
    return courses;
  }
  function filteredRegion() {
    return Boolean(filter.get("region"));
  }
  function activeFilters() {
    return hiddenFilters.some((f) => !!filter.get(f as any));
  }
  function searchIsLimited() {
    const relevantFilters = hiddenFilters.slice(); // clone
    relevantFilters.push("region");
    return relevantFilters.some((f) => !!filter.get(f as any));
  }
  function isMobile() {
    return Viewport.get().width <= ScssVars.screenXS;
  }
  function groupTagEvents() {
    return (groupId: string) => {
      return {
        onMouseOver:async () => {
          FilterPreview({
            property: "group",
            id: groupId,
            activate: true,
            delayed: true,
          });
        },
        onMouseOut:async () => {
          FilterPreview({
            property: "group",
            id: groupId,
            activate: false,
            delayed: true,
          });
        },
        onClick: async() => {
          Tooltips.hide();
          window.scrollTo(0, 0);
        },
      };
    };
  }

  // Read URL state
  useEffect(() => {
    filter.clear().read(query).done();

    if (query.coursesAmount) {
      const coursesAmount = Number.parseInt(query.coursesAmount, 10);
      if (coursesAmount > courseBlockSize) {
        setCourseLimit(coursesAmount);
      }
    } else {
      setCourseLimit(courseBlockSize);
    }
  }, [filter, query]);

  // When there are filters set, show the filtering pane
  useEffect(() => {
    Object.keys(filter.toParams()).forEach((name) => {
      if (hiddenFilters.includes(name)) {
        setShowingFilters(true);
      }
    });
  });

  if (isLoading()) {
    return <LoadingPage />;
  }

  return (
    <>
      <div className={`page-component row ${showingFilters ? "filter-expanded" : ""}`}>
        <div className="col-12">
          <h1 className="find-heading">{t("find.WhatLearn?", "What do I want to learn?")}</h1>
        </div>
        <div className={`col-12 ${!showingFilters ? "col-md-6 col-lg-7" : ""}`}>
          <SearchField {...searchFieldAttr()} />
        </div>
        <div className={`col-12 ${showingFilters ? "mb-3" : "col-md-6 col-lg-5"}`}>
          <Filter {...filterAttr()} />
        </div>
      </div>
      <div className="page-component">
        {hasResults() ? (
          <>
            <CourseList courses={results()} groupTagEvents={groupTagEvents()} />
            {hasMore() ? (
              <div className="text-center mt-3">
                <button type="button" className="btn btn-success js-more-courses">
                  {t("_button.more")}
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <>
            <div className="no-results">
              <div className="no-results-body">
                <span className="fa-solid fa-circle-exclamation fa-fw" aria-hidden="true"></span>
                {t("find.no-courses-found", "No Courses found")}
              </div>
              {searchIsLimited() ? (
                <div className="btn-group">
                  {filteredRegion() ? (
                    <button type="button" className="btn btn-secondary js-all-regions-btn">
                      <span className="fa-solid fa-location-dot" aria-hidden="true"></span>
                      {t("find.searchAllRegions", "Search in all regions")}
                    </button>
                  ) : null}

                  {activeFilters() ? (
                    <button type="button" className="btn btn-cancel js-toggle-filter">
                      {t("find.hideFilters")}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
      <div className="page-component">
        <div className="container mw-md">
          <Edit {...newCourse()} />
        </div>
      </div>
    </>
  );
}

// const template = Template.find;

// template.events({
//   "mouseover .js-category-label"(event, instance) {
//     FilterPreview({
//       property: "category",
//       id: event.target.dataset.category as string,
//       activate: true,
//       delayed: true,
//     });
//   },

//   "mouseout .js-category-label"(event, instance) {
//     FilterPreview({
//       property: "category",
//       id: event.target.dataset.category as string,
//       activate: false,
//       delayed: true,
//     });
//   },

//   "click .js-category-label"(_event, instance) {
//     Tooltips.hide();
//     instance.filter.add("categories", `${this}`).done();
//     instance.updateUrl();
//     window.scrollTo(0, 0);
//   },

//   "click .js-toggle-filter"(_event, instance) {
//     const showingFilters = !instance.showingFilters.get();
//     instance.showingFilters.set(showingFilters);

//     if (!showingFilters) {
//       filters.forEach((filter) => instance.filter.disable(filter as any));
//       instance.filter.done();
//       instance.updateUrl();
//     }
//   },

//   "click .js-all-regions-btn"() {
//     RegionSelection.change("all");
//   },

//   "click .js-more-courses"(_event, instance) {
//     const { courseLimit } = instance;
//     courseLimit.set(courseLimit.get() + instance.courseBlockSize);
//     instance.updateUrl();
//   },
// });

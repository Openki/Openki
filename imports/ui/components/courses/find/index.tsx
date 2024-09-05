import React, { ChangeEvent, useEffect, useState } from "react";
import { Router } from "meteor/iron:router";
import { ReactiveVar } from "meteor/reactive-var";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { Courses } from "/imports/api/courses/courses";

import * as UrlTools from "/imports/utils/url-tools";
import * as Tooltips from "/imports/utils/Tooltips";

import { CourseTemplate } from "/imports/ui/lib/course-template";
import * as RegionSelection from "/imports/utils/region-selection";
import { FilterPreview } from "/imports/ui/lib/filter-preview";
import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import { ScssVars } from "/imports/ui/lib/scss-vars";
import * as Viewport from "/imports/ui/lib/viewport";

import "/imports/ui/components/groups/tag";
import "/imports/ui/components/courses/edit";
import "/imports/ui/components/courses/list";
import "/imports/ui/components/courses/filter";
import { VisibleFilters, type Props as FilterProps } from "/imports/ui/components/courses/filter";
import "/imports/ui/components/search-field";

import "./template.html";
import "./styles.scss";

const hiddenFilters = ["needsRole", "categories"];
const filters = hiddenFilters.concat(["state"]);


export function Find(){

  return <> <div class="page-component row {{#if showingFilters}}filter-expanded{{/if}}">
  <div class="col-12">
    <h1 class="find-heading">
      {{i18n 'find.WhatLearn?' 'What do I want to learn?'}}
    </h1>
  </div>
  <div class="col-12 {{#unless showingFilters}}col-md-6 col-lg-7{{/unless}}">
    {{> searchField searchFieldAttr}}
  </div>
  <div class="col-12 {{#if showingFilters}}mb-3{{else}}col-md-6 col-lg-5{{/if}}">
    {{> filter filterAttr}}
  </div>
</div>
<div class="page-component">
  {{#if hasResults}}
    {{> courseList courses=results groupTagEvents=groupTagEvents}}

    {{#unless Template.subscriptionsReady}}
      {{> loadingPage}}
    {{/unless}}

    {{#if hasMore}}
      <div class="text-center mt-3">
        <button type="button" class="btn btn-success js-more-courses">
          {{i18n '_button.more'}}
        </button>
      </div>
    {{/if}}
  {{else}}
    {{#if Template.subscriptionsReady}}
      <div class="no-results">
        <div class="no-results-body">
          <span class="fa-solid fa-circle-exclamation fa-fw" aria-hidden="true"></span>
          {{i18n 'find.no-courses-found' 'No Courses found'}}
        </div>
        {{#if searchIsLimited}}
          <div class="btn-group">
            {{#if filteredRegion}}
              <button type="button" class="btn btn-secondary js-all-regions-btn">
                <span class="fa-solid fa-location-dot" aria-hidden="true"></span>
                {{i18n 'find.searchAllRegions' 'Search in all regions'}}
              </button>
            {{/if}}
            {{#if activeFilters}}
              <button type="button" class="btn btn-cancel js-toggle-filter">
                {{i18n 'find.hideFilters'}}
              </button>
            {{/if}}
          </div>
        {{/if}}
      </div>
    {{else}}
      {{> loadingPage}}
    {{/if}}
  {{/if}}
</div>
<div class="page-component">
  <div class="container mw-md">
    {{> courseEdit newCourse}}
  </div>
</div></>
}

const Template = TemplateAny as TemplateStaticTyped<
  "find",
  {
    [key: string]: string;
  },
  {
    updateUrl: () => boolean;
    showingFilters: ReactiveVar<boolean>;

    courseBlockSize: number;
    courseLimit: ReactiveVar<number>;
    filter: ReturnType<(typeof Courses)["Filtering"]>;
  }
>;

const template = Template.find;

template.onCreated(function () {
  const instance = this;

  // Reflect filter selection in URI
  // This creates a browser history entry so it is not done on every filter
  // change. For example, when the search-field receives keydowns, the filter
  // is updated but the change is not reflected in the URI.
  instance.updateUrl = function () {
    const urlParams = instance.filter.toParams() as {
      [name: string]: string;
    };
    delete urlParams.region; // HACK region is kept in the session (for bad reasons)
    delete urlParams.internal;

    // used to keep scrollpos when navigating back
    if (instance.courseLimit.get() > instance.courseBlockSize) {
      urlParams.coursesAmount = instance.courseLimit.get().toString();
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
  };

  instance.showingFilters = new ReactiveVar(false);
  instance.courseBlockSize = 36;
  instance.courseLimit = new ReactiveVar(instance.courseBlockSize);

  const filter = Courses.Filtering();
  instance.filter = filter;

  // Read URL state
  instance.autorun(() => {
    const query = Template.currentData();

    filter.clear().read(query).done();

    if (query.coursesAmount) {
      const coursesAmount = Number.parseInt(query.coursesAmount, 10);
      if (coursesAmount > instance.courseBlockSize) {
        instance.courseLimit.set(coursesAmount);
      }
    } else {
      instance.courseLimit.set(instance.courseBlockSize);
    }
  });

  // When there are filters set, show the filtering pane
  instance.autorun(() => {
    Object.keys(filter.toParams()).forEach((name) => {
      if (hiddenFilters.includes(name)) {
        instance.showingFilters.set(true);
      }
    });
  });

  // Update whenever filter changes
  instance.autorun(() => {
    const filterQuery = filter.toQuery();

    // Add one to the limit so we know there is more to show
    const limit = instance.courseLimit.get() + 1;

    instance.subscribe("Courses.findFilter", filterQuery, limit);
  });
});

template.helpers({
  searchFieldAttr() {
    const instance = Template.instance();
    return {
      search: instance.filter.get("search"),
      onChange: (newValue: string) => {
        instance.filter.add("search", newValue).done();
      },
      onFocusOut: () => {
        instance.updateUrl();
      },
    };
  },

  filterAttr(): FilterProps {
    const instance = Template.instance();
    return {
      showingFilters: instance.showingFilters.get(),
      // check if one of the filters indicated as filters is active
      active: VisibleFilters.some((filter) => instance.filter.get(filter)),
      onToggleFilters: () => {
        const { showingFilters } = instance;

        if (showingFilters.get()) {
          VisibleFilters.forEach((filter) => {
            instance.filter.disable(filter);
          });

          instance.filter.done();
          instance.updateUrl();
          showingFilters.set(false);
        } else {
          showingFilters.set(true);
        }
      },
      state: instance.filter.get("state") || [],
      onStateClick: (state) => {
        instance.filter.disable("state").toggle("state", state.name).done();

        instance.updateUrl();
      },
      onStateMouseOver: (state) => {
        if (!instance.filter.get("state")) {
          FilterPreview({
            property: "state",
            id: state.cssClass,
            activate: true,
          });
        }
      },
      onStateMouseOut: (state) => {
        if (!instance.filter.get("state")) {
          FilterPreview({
            property: "state",
            id: state.cssClass,
            activate: false,
          });
        }
      },
      archived: instance.filter.get("archived") || false,
      onArchivedClick: () => {
        instance.filter.toggle("archived").done();
        instance.updateUrl();
      },
      onArchivedMouseOver: () => {
        if (!instance.filter.get("archived")) {
          FilterPreview({
            property: "is",
            id: "archived",
            activate: true,
          });
        }
      },
      onArchivedMouseOut: () => {
        if (!instance.filter.get("archived")) {
          FilterPreview({
            property: "is",
            id: "archived",
            activate: false,
          });
        }
      },
      categories: instance.filter.get("categories") || [],
      onCategoryAdd: (category: string) => {
        instance.filter.add("categories", category).done();
        instance.updateUrl();
      },
      onCategoryRemove: (category: string) => {
        instance.filter.remove("categories", category).done();
        instance.updateUrl();
      },
      needsRole: instance.filter.get("needsRole") || [],
      onNeedsRoleClick: (role) => {
        instance.filter.toggle("needsRole", role).done();
        instance.updateUrl();
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
  },

  showingFilters() {
    return Template.instance().showingFilters.get();
  },

  newCourse() {
    const instance = Template.instance();
    const course = CourseTemplate();
    course.filter = instance.filter;
    const search = instance.filter.get("search");
    if (search) {
      course.name = search;
    }
    const groupId = instance.filter.get("group");
    if (groupId) {
      course.group = groupId;
    }
    return course;
  },

  hasResults() {
    const filterQuery = Template.instance().filter.toQuery();
    return Courses.findFilter(filterQuery, 1).count() > 0;
  },

  hasMore() {
    const instance = Template.instance();

    const filterQuery = instance.filter.toQuery();
    const limit = instance.courseLimit.get();
    const results = Courses.findFilter(filterQuery, limit + 1);

    return results.count() > limit;
  },

  results() {
    const instance = Template.instance();
    const filterQuery = instance.filter.toQuery();

    return Courses.findFilter(filterQuery, instance.courseLimit.get());
  },

  filteredRegion() {
    return Boolean(Template.instance().filter.get("region"));
  },

  activeFilters() {
    const activeFilters = Template.instance().filter;
    return hiddenFilters.some((filter) => !!activeFilters.get(filter as any));
  },

  searchIsLimited() {
    const activeFilters = Template.instance().filter;
    const relevantFilters = hiddenFilters.slice(); // clone
    relevantFilters.push("region");
    return relevantFilters.some((filter) => !!activeFilters.get(filter as any));
  },

  isMobile() {
    return Viewport.get().width <= ScssVars.screenXS;
  },

  groupTagEvents() {
    return (groupId: string) => {
      const instance = Template.instance();
      return {
        onMouseOver: () => {
          FilterPreview({
            property: "group",
            id: groupId,
            activate: true,
            delayed: true,
            instance,
          });
        },
        onMouseOut: () => {
          FilterPreview({
            property: "group",
            id: groupId,
            activate: false,
            delayed: true,
            instance,
          });
        },
        onClick: () => {
          Tooltips.hide();
          window.scrollTo(0, 0);
        },
      };
    };
  },
});

template.events({
  "mouseover .js-category-label"(event, instance) {
    FilterPreview({
      property: "category",
      id: event.target.dataset.category as string,
      activate: true,
      delayed: true,
      instance,
    });
  },

  "mouseout .js-category-label"(event, instance) {
    FilterPreview({
      property: "category",
      id: event.target.dataset.category as string,
      activate: false,
      delayed: true,
      instance,
    });
  },

  "click .js-category-label"(_event, instance) {
    Tooltips.hide();
    instance.filter.add("categories", `${this}`).done();
    instance.updateUrl();
    window.scrollTo(0, 0);
  },

  "click .js-toggle-filter"(_event, instance) {
    const showingFilters = !instance.showingFilters.get();
    instance.showingFilters.set(showingFilters);

    if (!showingFilters) {
      filters.forEach((filter) => instance.filter.disable(filter as any));
      instance.filter.done();
      instance.updateUrl();
    }
  },

  "click .js-all-regions-btn"() {
    RegionSelection.change("all");
  },

  "click .js-more-courses"(_event, instance) {
    const { courseLimit } = instance;
    courseLimit.set(courseLimit.get() + instance.courseBlockSize);
    instance.updateUrl();
  },
});

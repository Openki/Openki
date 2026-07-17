import React, { useEffect, useState } from "react";
// import { Router } from "meteor/iron:router";
// import { useCurrentRouteName, useParams } from "/imports/utils/react-meteor-router";

import { SortSpec } from "/imports/utils/sort-spec";

// import * as UrlTools from "/imports/utils/url-tools";
import * as Tooltips from "/imports/utils/Tooltips";

import * as RegionSelection from "/imports/utils/region-selection";
import { FilterPreview } from "/imports/ui/lib/filter-preview";
// import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";

import { Filter, VisibleFilters, type Props as FilterProps } from "../filter";

import { useTranslation } from "react-i18next";
import { SearchField } from "/imports/ui/components/search-field";
import { GroupList } from "../List";
import { Edit, Props as GroupEditProps } from "../edit";
import { useFindFilter } from "/imports/api/groups/publications";
import { FindParams } from "/imports/api/groups/groups";
import { LoadingPage } from "/imports/ui/pages/loading";
import { useFiltering } from "/imports/utils/filtering";

import "./styles.scss";

const hiddenFilters: (keyof typeof FindParams)[] = ["needsRole", "categories"];
const filters = hiddenFilters.concat(["state"]);

export interface Props {
  query: Record<string, string | undefined>;
}

export function Find({ query }: Props) {
  const { t } = useTranslation();
  const [showingFilters, setShowingFilters] = useState(false);
  const groupBlockSize = 36;
  const [groupLimit, setGroupLimit] = useState(groupBlockSize);
  const filter = useFiltering(FindParams, query);
  const sort = query.sort ? SortSpec.fromString(query.sort) : SortSpec.unordered();

  // Add one to the limit so we know there is more to show
  const [isLoading, groups] = useFindFilter(filter.asQuery, groupLimit + 1, 0, sort.spec());
  // const searchParams = useParams();
  // const currentRouterName = useCurrentRouteName();

  // Reflect filter selection in URI
  // This creates a browser history entry so it is not done on every filter
  // change. For example, when the search-field receives keydowns, the filter
  // is updated but the change is not reflected in the URI.
  // current disabled until migrate to new router
  // function updateUrl() {
  //   const urlParams = filter.asParams as Record<string, string>;
  //   delete urlParams.region; // HACK region is kept in the session (for bad reasons)
  //   delete urlParams.internal;

  //   // used to keep scrollpos when navigating back
  //   if (groupLimit > groupBlockSize) {
  //     urlParams.groupsAmount = groupLimit.toString();
  //   }
  //   const queryString = UrlTools.paramsToQueryString(urlParams);

  //   const options: { query?: string; replaceState?: boolean } = {};

  //   if (queryString.length) {
  //     options.query = queryString;
  //   }

  //   // fix: replace current state to prevent endless reloads on back
  //   options.replaceState = true;

  //   routerAutoscroll.cancelNext();

  //   Router.go(currentRouterName, { _id: searchParams._id }, options);
  // }

  function searchFieldAttr() {
    return {
      search: filter.asQuery["search"],
      onChange: (newValue: string) => filter.add("search", newValue),
    };
  }
  function filterAttr(): FilterProps {
    return {
      showingFilters,
      // check if one of the filters indicated as filters is active
      active: VisibleFilters.some((f) => filter.asQuery[f]),
      onToggleFilters: () => {
        if (showingFilters) {
          VisibleFilters.forEach((f) => filter.disable(f));

          setShowingFilters(false);
        } else {
          setShowingFilters(true);
        }
      },
      state: filter.asQuery["state"] || [],
      onStateClick: (state) => filter.toggle("state", state.name),
      onStateMouseOver: (state) => {
        if (!filter.asQuery["state"]) {
          FilterPreview({
            property: "state",
            id: state.cssClass,
            activate: true,
          });
        }
      },
      onStateMouseOut: (state) => {
        if (!filter.asQuery["state"]) {
          FilterPreview({
            property: "state",
            id: state.cssClass,
            activate: false,
          });
        }
      },
      archived: filter.asQuery["archived"] || false,
      onArchivedClick: () => filter.toggle("archived"),
      onArchivedMouseOver: () => {
        if (!filter.asQuery["archived"]) {
          FilterPreview({
            property: "is",
            id: "archived",
            activate: true,
          });
        }
      },
      onArchivedMouseOut: () => {
        if (!filter.asQuery["archived"]) {
          FilterPreview({
            property: "is",
            id: "archived",
            activate: false,
          });
        }
      },
      categories: filter.asQuery["categories"] || [],
      onCategoryAdd: (category: string) => filter.add("categories", category),
      onCategoryRemove: (category: string) => filter.remove("categories", category),
      needsRole: filter.asQuery["needsRole"] || [],
      onNeedsRoleClick: (role) => filter.toggle("needsRole", role),
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

  function newGroup() {
    const group: Partial<GroupEditProps> = {};
    const search = filter.asQuery["search"];
    if (search) {
      group.name = search;
    }
    const organizationId = filter.asQuery["organization"];
    if (organizationId) {
      group.organization = organizationId;
    }
    return group;
  }
  function hasResults() {
    return groups.length > 0;
  }
  function hasMore() {
    return groups.length > groupLimit;
  }
  function results() {
    return groups.slice(0, groupLimit);
  }
  function filteredRegion() {
    return !!filter.asQuery["region"];
  }
  function activeFilters() {
    return hiddenFilters.some((f) => filter.asQuery[f]);
  }
  function searchIsLimited() {
    const relevantFilters = hiddenFilters.slice(); // clone
    relevantFilters.push("region");
    return relevantFilters.some((f) => filter.asQuery[f]);
  }
  function organizationTagEvents() {
    return (organizationId: string) => {
      return {
        onMouseOver: async () => {
          FilterPreview({
            property: "organization",
            id: organizationId,
            activate: true,
            delayed: true,
          });
        },
        onMouseOut: async () => {
          FilterPreview({
            property: "organization",
            id: organizationId,
            activate: false,
            delayed: true,
          });
        },
        onClick: async () => {
          Tooltips.hide();
          window.scrollTo(0, 0);
        },
      };
    };
  }

  function categoryTagEvents() {
    return (category: string) => {
      return {
        onMouseOver: async () => {
          FilterPreview({
            property: "category",
            id: category,
            activate: true,
            delayed: true,
          });
        },
        onMouseOut: async () => {
          FilterPreview({
            property: "category",
            id: category,
            activate: false,
            delayed: true,
          });
        },
        onClick: async () => {
          Tooltips.hide();
          filter.add("categories", category);
          window.scrollTo(0, 0);
        },
      };
    };
  }

  function handleToggleFilter() {
    if (showingFilters) {
      filters.forEach((f) => filter.disable(f));
    }
    setShowingFilters(!showingFilters);
  }
  // useEffect(() => {
  //   updateUrl();
  //   // update only when params has changed
  // }, [JSON.stringify(filter.asParams)]);

  // Read URL state
  useEffect(() => {
    if (query.groupsAmount) {
      const groupsAmount = Number.parseInt(query.groupsAmount, 10);
      if (groupsAmount > groupBlockSize) {
        setGroupLimit(groupsAmount);
      }
    } else {
      setGroupLimit(groupBlockSize);
    }
  }, [query]);

  // When there are filters set, show the filtering pane
  useEffect(() => {
    Object.keys(filter.asParams).forEach((name) => {
      if (hiddenFilters.some((f) => f === name)) {
        setShowingFilters(true);
      }
    });
  });

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
        {isLoading() ? (
          <LoadingPage />
        ) : hasResults() ? (
          <>
            <GroupList
              groups={results()}
              organizationTagEvents={organizationTagEvents()}
              categoryTagEvents={categoryTagEvents()}
              containsPropose
              organization={filter.asQuery["organization"]}
            />
            {hasMore() && (
              <div className="text-center mt-3">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => {
                    setGroupLimit(groupLimit + groupBlockSize);
                  }}
                >
                  {t("_button.more")}
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="no-results">
              <div className="no-results-body">
                <i className="fa-solid fa-circle-exclamation fa-fw" />{" "}
                {t("find.noGroupsFound", "No groups found")}
              </div>
              {searchIsLimited() && (
                <div className="btn-group">
                  {filteredRegion() && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        RegionSelection.change("all");
                      }}
                    >
                      <i className="fa-solid fa-location-dot" />{" "}
                      {t("find.searchAllRegions", "Search in all regions")}
                    </button>
                  )}

                  {activeFilters() && (
                    <button type="button" className="btn btn-cancel" onClick={handleToggleFilter}>
                      {t("find.hideFilters")}
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <div className="page-component">
        <div className="container mw-md">
          <Edit {...newGroup()} groupsQuery={filter.asQuery} />
        </div>
      </div>
    </>
  );
}

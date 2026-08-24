import React, { useState } from "react";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";

import { useFindFilter } from "/imports/api/groups/publications";
import { FindParams } from "/imports/api/groups/groups";

import { SortSpec } from "/imports/utils/sort-spec";
import * as Tooltips from "/imports/utils/Tooltips";
import * as RegionSelection from "/imports/utils/region-selection";
import { FilterPreview } from "/imports/ui/lib/filter-preview";
import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import { Filtering } from "/imports/utils/filtering";
import { cx } from "/imports/utils/cx";
import { useCurrentRouteName } from "/imports/utils/react-meteor-router";
import * as Predicates from "/imports/utils/predicates";

import { Filter, VisibleFilters, type Props as FilterProps } from "../filter";
import { SearchField, type Props as SearchFieldProps } from "/imports/ui/components/search-field";
import { GroupList } from "../List";
import { Edit, Props as GroupEditProps } from "../edit";
import { LoadingPage } from "/imports/ui/pages/loading";

import "./styles.scss";

const hiddenFilters: (keyof typeof FindParams)[] = ["needsRole", "categories"];
const filters = hiddenFilters.concat(["state"]);

export interface Props {
  query: Record<string, string | undefined>;
}

export function Find({ query }: Props) {
  const { t } = useTranslation();

  const groupBlockSize = 36;

  const filter = new Filtering({
    ...FindParams,
    groupsAmount: Predicates.integer,
  }).read(query);
  const sort = query.sort ? SortSpec.fromString(query.sort) : SortSpec.unordered();

  // Add one to the limit so we know there is more to show
  const { groupsAmount, ...groupsQuery } = filter.toQuery();
  const groupLimit = groupsAmount || groupBlockSize;
  const [isLoading, groups] = useFindFilter(groupsQuery, groupLimit + 1, 0, sort.spec());

  let showingFiltersDefault = false;
  Object.keys(filter.toParams()).forEach((name) => {
    if (hiddenFilters.some((f) => f === name)) {
      showingFiltersDefault = true;
    }
  });
  const [showingFilters, setShowingFilters] = useState(showingFiltersDefault);

  const routeName = useCurrentRouteName();

  function update() {
    const query = filter.toParams();

    delete query.region; // HACK region is kept in the session (for bad reasons)
    delete query.internal;

    const groupsAmount = filter.get("groupsAmount");
    if (groupsAmount && groupsAmount <= groupBlockSize) {
      delete query.groupsAmount;
    }

    routerAutoscroll.cancelNext();

    Router.go(routeName, {}, { query });
  }

  function searchFieldAttr(): SearchFieldProps {
    return {
      search: filter.get("search") ?? "",
      onChange: (newValue) => {
        filter.disable("groupsAmount");
        filter.add("search", newValue);
        update();
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
          filter.disable("groupsAmount");
          VisibleFilters.forEach((f) => filter.disable(f));

          setShowingFilters(false);

          update();
        } else {
          setShowingFilters(true);
        }
      },
      state: filter.get("state") || [],
      onStateClick: (state) => {
        filter.disable("groupsAmount");
        filter.toggle("state", state.name);
        update();
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
      archived: filter.get("archived") ?? false,
      onArchivedClick: () => {
        filter.disable("groupsAmount");
        filter.toggle("archived");
        update();
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
      categories: filter.get("categories") ?? [],
      onCategoriesChange: (categories) => {
        filter.disable("groupsAmount");
        filter.set("categories", categories);
        update();
      },
      needsRole: filter.get("needsRole") ?? [],
      onNeedsRoleClick: (role) => {
        filter.disable("groupsAmount");
        filter.toggle("needsRole", role);
        update();
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

  function newGroup() {
    const group: Partial<GroupEditProps> = {};
    const search = filter.get("search");
    if (search) {
      group.name = search;
    }
    const organizationId = filter.get("organization");
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
    return Boolean(filter.get("region"));
  }
  function activeFilters() {
    return hiddenFilters.some((f) => filter.get(f));
  }
  function searchIsLimited() {
    const relevantFilters = hiddenFilters.slice(); // clone
    relevantFilters.push("region");
    return relevantFilters.some((f) => filter.get(f));
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
          filter.disable("groupsAmount");
          Tooltips.hide();
          filter.add("categories", category);
          window.scrollTo(0, 0);
          update();
        },
      };
    };
  }

  function handleToggleFilter() {
    if (showingFilters) {
      filter.disable("groupsAmount");
      filters.forEach((f) => filter.disable(f));

      setShowingFilters(false);
      update();
    } else {
      setShowingFilters(true);
    }
  }

  return (
    <>
      <div className={cx("page-component row", showingFilters && "filter-expanded")}>
        <div className="col-12">
          <h1 className="find-heading">{t("find.WhatLearn?", "What do I want to learn?")}</h1>
        </div>
        <div className={cx("col-12", !showingFilters && "col-md-6 col-lg-7")}>
          <SearchField {...searchFieldAttr()} />
        </div>
        <div className={cx("col-12", showingFilters ? "mb-3" : "col-md-6 col-lg-5")}>
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
              organization={filter.get("organization")}
            />
            {hasMore() && (
              <div className="text-center mt-3">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => {
                    filter.set("groupsAmount", groupLimit + groupBlockSize);
                    update();
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
                      onClick={() => RegionSelection.change("all")}
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
          <Edit {...newGroup()} groupsQuery={groupsQuery} />
        </div>
      </div>
    </>
  );
}

import React from "react";
import { useTranslation } from "react-i18next";
import { cx } from "/imports/utils/cx";

import { AdditionalFilters, Props as AdditionalFiltersProps } from "./additional-filters";

import "./styles.scss";

export const VisibleFilters = ["state", "archived", "needsRole", "categories"] as const;

export type Props = {
  showingFilters: boolean;
  active: boolean;
  onToggleFilters: () => void;
  state: string[];
  onStateClick: (state: StateFilter) => void;
  onStateMouseOver: (state: StateFilter) => void;
  onStateMouseOut: (state: StateFilter) => void;
  archived: boolean;
  onArchivedClick: () => void;
  onArchivedMouseOver: () => void;
  onArchivedMouseOut: () => void;
} & AdditionalFiltersProps;

export interface StateFilter {
  name: string;
  cssClass: string;
  label: string;
  title: string;
}

export function Filter(props: Props) {
  const { showingFilters } = props;

  const { t } = useTranslation();

  const StateFilters: StateFilter[] = [
    {
      name: "proposal",
      cssClass: "is-proposal",
      label: t("filterCaptions.is-proposal", "Proposal"),
      title: t("filterCaptions.showProposal", "Show all proposed groups"),
    },
    {
      name: "upcomingEvent",
      cssClass: "has-upcoming-events",
      label: t("filterCaptions.upcoming.label", "Upcoming"),
      title: t("filterCaptions.upcoming.title", "Show all groups with upcoming events"),
    },
    {
      name: "resting",
      cssClass: "has-past-events",
      label: t("filterCaptions.resting.label", "Resting"),
      title: t("filterCaptions.resting.title", "Groups with passed but without upcoming events"),
    },
  ];

  function filterClasses() {
    const classes = [];

    if (props.active) {
      classes.push("active");
    }

    if (showingFilters) {
      classes.push("open");
    }

    return classes.join(" ");
  }

  function stateFilterClasses(stateFilter: StateFilter) {
    const classes = [];

    classes.push(stateFilter.cssClass);

    if (props.state.includes(stateFilter.name)) {
      classes.push("active");
    }

    if (props.archived) {
      // make filter buttons yellow if only archived showed
      classes.push("is-archived");
    }

    return classes.join(" ");
  }

  return (
    <div className={cx("filter", filterClasses())}>
      {showingFilters && (
        <h4 className="filter-heading">
          <i className="fa-solid fa-filter fa-fw" />
          {t("find.search_filter.title", "Filter search")}
          <span className="filter-active-tag">{t("find.filter.isActive", "active")}</span>
          <div className="filter-captions-header-buttons">
            <button
              className="btn btn-lg btn-link p-0"
              type="button"
              onClick={() => {
                props.onToggleFilters();
              }}
            >
              <span className="filter-remove-btn-text">
                {t("find.hideFilters", "Remove all filters")}
              </span>
            </button>
          </div>
        </h4>
      )}
      <div className="row">
        <div className="col filter-component">
          <h4 className="filter-component-header">{t("find.filter.groupStates", "States")}</h4>
          <div className="row gx-3">
            {StateFilters.map((stateFilter) => (
              <div key={stateFilter.name} className="col filter-captions-column">
                <div className="filter-caption-wrap">
                  <div
                    className={cx("filter-caption", stateFilterClasses(stateFilter))}
                    title={stateFilter.title}
                    onClick={() => {
                      props.onStateClick(stateFilter);
                    }}
                    onMouseOver={() => {
                      props.onStateMouseOver(stateFilter);
                    }}
                    onMouseOut={() => {
                      props.onStateMouseOut(stateFilter);
                    }}
                  >
                    <span className="filter-caption-text">
                      {stateFilter.label}
                      <i className="fa-solid fa-check fa-fw" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {showingFilters && (
            <div className="mt-2 row gx-3">
              <div className="col-sm-4 offset-sm-8 filter-captions-column">
                <div className="filter-caption-wrap">
                  <div
                    className={cx("filter-caption is-archived", props.archived && "active")}
                    title={t("filterCaptions.archived.title", "Show only groups that are archived")}
                    onClick={() => {
                      props.onArchivedClick();
                    }}
                    onMouseOver={() => {
                      props.onArchivedMouseOver();
                    }}
                    onMouseOut={() => {
                      props.onArchivedMouseOut();
                    }}
                  >
                    <span className="filter-caption-text">
                      {t("filterCaptions.archived.label", "Archived")}
                      <i className="fa-solid fa-check fa-fw" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {showingFilters && <AdditionalFilters {...props} />}
      </div>
      {!showingFilters && (
        <div className="filter-actions">
          <button
            className="btn btn-link p-0"
            type="button"
            onClick={() => {
              props.onToggleFilters();
            }}
          >
            {t("filter.showAllFilters", "Show all filters")}
          </button>
        </div>
      )}
    </div>
  );
}

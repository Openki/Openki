import React, { ReactNode, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";
import { Mongo } from "meteor/mongo";

import { RegionEntity, RegionModel, Regions } from "/imports/api/regions/regions";

import { useCurrentRouteName } from "/imports/ui/hooks/react-meteor-router";
import { useCurrentRegion } from "/imports/ui/hooks/useCurrentRegion";
import * as RegionSelectionUtils from "/imports/utils/region-selection";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { useLocalizedSetting } from "/imports/utils/getLocalizedValue";
import { useSiteName } from "/imports/utils/getSiteName";
import { cx } from "/imports/utils/cx";

import { Option } from "./Option";

import "./styles.scss";

export interface Props {
  className?: string | undefined;
  size?: "medium" | "small" | undefined;
  autoFocus?: boolean | undefined;
  append?: ReactNode | undefined;
  onSelect?: (() => void) | undefined;
  onClose?: (() => void) | undefined;
}

export function Select({ className, size, autoFocus, append, onClose, onSelect }: Props) {
  const { t } = useTranslation();
  const minNumberOfRegionInSelection = PublicSettings.regionSelection.minNumber;
  const [search, setSearch] = useState("");
  const [searchHasFocus, setSearchHasFocus] = useState(autoFocus || false);
  const [showAllRegions, setShowAllRegions] = useState(false);
  const searchElementRef = useRef<HTMLInputElement>(null);
  const dropdownToggleElementRef = useRef<HTMLButtonElement>(null);
  const currentRouteName = useCurrentRouteName();
  const { getLocalizedValue } = useLocalizedSetting();

  const currentRegion = useCurrentRegion();
  const siteName = useSiteName();

  function regions(options: { active?: boolean; limit?: number } = {}) {
    // read the current region
    const currentId: string = currentRegion?._id || "";

    // prepare for query
    const query: Mongo.Selector<RegionEntity> = {};
    if (search && search !== "") {
      query.name = new RegExp(search, "i");
    }
    // first get all available regions from minimongo (that are not excluded by search)
    let regionsArray = Regions.find(query).fetch();

    // sort in the order we want
    regionsArray.sort((a, b) => {
      // first priority has the current region
      if (a._id === currentId) return -1;
      if (b._id === currentId) return 1;

      // second priority have private regions
      const pa = a.isPrivate();
      const pb = b.isPrivate();
      if (pa && !pb) return -1;
      if (pb && !pa) return 1;

      // then regions with more future events first
      if (a.futureEventCount > b.futureEventCount) return -1;
      if (b.futureEventCount > a.futureEventCount) return 1;

      // finally regions with more future groups
      if (a.groupCount > b.groupCount) return -1;
      if (b.groupCount > a.groupCount) return 1;

      // if no return happened yet, regions are equivalent
      return 0;
    });

    // filter active option
    if (typeof options.active === "boolean") {
      if (options.active === true) {
        regionsArray = regionsArray.filter((e) => e.futureEventCount > 0);
      } else {
        regionsArray = regionsArray.filter((e) => e.futureEventCount === 0);
      }
    }

    // filter limit option
    if (options.limit) {
      regionsArray = regionsArray.slice(0, options.limit);
    }

    return regionsArray;
  }

  function changeRegion(regionId: string) {
    setSearchHasFocus(false);

    const changed = currentRegion?._id !== regionId;

    RegionSelectionUtils.change(regionId);

    // When the region changes, we want the content of the page to update
    // Many pages do not change when the region changed, so we go to
    // the homepage for those
    if (changed) {
      const routeName = currentRouteName;
      if (!RegionSelectionUtils.regionDependentRoutes.includes(routeName)) {
        Router.go("home");
      }
    }

    onSelect?.();
    onClose?.();
  }

  function allGroups() {
    return Regions.find()
      .fetch()
      .reduce((acc, region) => acc + region.groupCount, 0);
  }
  function allUpcomingEvents() {
    return Regions.find()
      .fetch()
      .reduce((acc, region) => acc + region.futureEventCount, 0);
  }
  function hasMore() {
    const minNumber = minNumberOfRegionInSelection;

    const numberOfRegions = regions().length;

    return numberOfRegions > minNumber;
  }
  function allRegions() {
    return regions();
  }
  function notAllRegions() {
    const minNumber = minNumberOfRegionInSelection;
    return regions({ limit: minNumber });
  }
  function aboutLink() {
    return getLocalizedValue(PublicSettings.regionSelection.aboutLink);
  }

  useEffect(() => {
    const element = dropdownToggleElementRef.current;
    if (!element) {
      return undefined;
    }

    if (searchHasFocus) {
      $(element).dropdown("show");

      if (!searchElementRef.current) throw new Error("Unexpected falsy: searchElementRef.current");
      searchElementRef.current?.select();
    }

    function handleHide(event: Event) {
      if (!searchHasFocus) {
        onClose?.();
        return true;
      }

      // Stop closing
      event.preventDefault();
      return false;
    }
    element.addEventListener("hide.bs.dropdown", handleHide);
    return () => {
      element.removeEventListener("hide.bs.dropdown", handleHide);
    };
  }, [searchHasFocus, onClose]);

  function handleItemClick(region?: RegionModel) {
    const regionId = region?._id || "all";
    changeRegion(regionId);
    return false;
  }

  function handleSearchKeyUp(event: React.KeyboardEvent<HTMLInputElement>) {
    const newSearch = event.currentTarget.value.trim();
    if (newSearch !== search) {
      setSearch(newSearch);
      setShowAllRegions(search !== "");
    }
  }

  function handleSearchFocus() {
    setSearchHasFocus(true);
  }

  function handleSearchBlur() {
    setSearchHasFocus(false);
  }

  function handleShowAllClick(event: React.MouseEvent<HTMLButtonElement>) {
    // prevent menu close
    event.stopPropagation();

    setShowAllRegions(true);
    setSearchHasFocus(true);
  }

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (search !== "") {
      const selectedRegion = regions()[0];
      if (selectedRegion) {
        changeRegion(selectedRegion._id);
      } else {
        changeRegion("all");
      }
    }
  }

  return (
    <li className={cx("region-select", className)}>
      <form className="d-flex region-search-form" onSubmit={handleSubmit}>
        <div
          className={cx(
            "input-group input-group-outline",
            size === "small" && "input-group-sm p-2",
          )}
        >
          <span className="input-group-text">
            <i className="fa-solid fa-location-dot fa-fw" />
          </span>
          <input
            ref={searchElementRef}
            className="form-control"
            type="search"
            defaultValue={
              currentRegion ? currentRegion.name : t("menue.All regions", "All regions") || ""
            }
            onKeyUp={handleSearchKeyUp}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
          <input className="d-none" type="submit" />
          <button
            className="btn dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            data-bs-auto-close="outside"
            tabIndex={-1}
            ref={dropdownToggleElementRef}
          />
          <ul className="dropdown-menu dropdown-menu-end mx-2" role="menu">
            <li className="dropdown-header dropdown-legend">
              <div className="dropdown-addon-right">
                <span
                  className="badge bg-primary rounded-pill"
                  title={t("regionSelection.legend.numGroupsTitle", "Number of groups")}
                >
                  # <i className="fa-solid fa-circle" />
                </span>{" "}
                <span
                  className="badge bg-success text-dark rounded-pill"
                  title={t("regionSelection.legend.numEventsTitle", "Number of upcoming events")}
                >
                  # <i className="fa-solid fa-calendar" />
                </span>
              </div>
              {t("regionSelection.legend.region", "Region")}
            </li>
            <li>
              <a
                href="#"
                className="dropdown-item"
                title={t("menue.All regions")}
                onClick={() => handleItemClick()}
              >
                <div className="dropdown-addon-right">
                  <span
                    className="badge bg-primary rounded-pill"
                    title={t(
                      "regions.allGroups.title",
                      "{COUNT, plural, =0{no groups} one{one group} other{# groups} } on {SITENAME}",
                      { COUNT: allGroups(), SITENAME: siteName },
                    )}
                  >
                    {allGroups()}
                  </span>{" "}
                  <span
                    className="badge bg-success text-dark rounded-pill"
                    title={t(
                      "regions.allUpcomingEvents.title",
                      "{COUNT, plural, =0{no upcoming events} one{one upcoming event} other{# upcoming events} } on {SITENAME}",
                      { COUNT: allUpcomingEvents(), SITENAME: siteName },
                    )}
                  >
                    {allUpcomingEvents()}
                  </span>
                </div>
                {!currentRegion ? (
                  <>
                    <span className="checkmark fa-solid fa-check"></span>{" "}
                    <span className="fw-bold">{t("menue.All regions", "All regions")}</span>
                  </>
                ) : (
                  t("menue.All regions", "All regions")
                )}
              </a>
            </li>
            {showAllRegions ? (
              //  here follows the "long" version, all regions that the user has access to
              <>
                {allRegions().map((region) => (
                  <Option
                    key={region._id}
                    region={region}
                    search={search}
                    onClick={() => handleItemClick(region)}
                  />
                ))}
                {!!aboutLink() && (
                  <>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <a className="dropdown-item" href={aboutLink()}>
                        <i className="fa-solid fa-circle-info" />{" "}
                        {t("regionSelection.aboutLink", "About regions")}
                      </a>
                    </li>
                  </>
                )}
              </>
            ) : (
              // here follows the "short" version, only some regions are shown
              <>
                {notAllRegions().map((region) => (
                  <Option
                    key={region._id}
                    region={region}
                    search={search}
                    onClick={() => handleItemClick(region)}
                  />
                ))}
                {hasMore() && (
                  <>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button
                        data-test="region-select-show-more"
                        className="btn btn-link"
                        type="button"
                        onClick={handleShowAllClick}
                      >
                        {t("regionSelection.showAll", "Show more regions")}
                      </button>
                    </li>
                  </>
                )}
              </>
            )}
          </ul>
          {append}
        </div>
      </form>
    </li>
  );
}

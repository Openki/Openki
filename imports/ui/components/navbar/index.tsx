import React, { useLayoutEffect, useRef, useState } from "react";
import { Router } from "meteor/iron:router";
import { useLocalizedSetting } from "/imports/utils/getLocalizedValue";

import { useEventListener } from "/imports/utils/useEventListener";
import { ScssVars } from "/imports/ui/lib/scss-vars";
import { useViewportSize } from "../../lib/useViewportSize";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { useTranslation } from "react-i18next";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";
import { useCurrentRouteName } from "/imports/utils/react-meteor-router";
import { useMeteorStatus } from "/imports/utils/react-meteor-data";
import { useSiteName } from "/imports/utils/getSiteName";

import { Collapse } from "/imports/startup/client/bootstrap";
import { RegionSelectionWrap } from "/imports/ui/components/regions/selection/wrap";
import { LanguageSelection } from "/imports/ui/components/language-selection";
import { TestWarningTicker } from "./test-warning-ticker";
import { UserFrame } from "./user-frame";
import { LoginButton } from "./login-button";

import "./styles.scss";

// template.events({

//   "show.bs.dropdown, hide.bs.dropdown .dropdown"(event, instance) {
//     const { gridFloatBreakpoint } = ScssVars;

//     if (Viewport.get().width <= gridFloatBreakpoint) {
//       const container = instance.$("#bs-navbar-collapse");

//       // make menu item scroll up when opening the dropdown menu
//       if (event.type === "show") {
//         const scrollTo = $(event.currentTarget);
//         if (scrollTo && container) {
//           const scrollToOffset = scrollTo.offset();
//           const containerOffset = container.offset();
//           const containerScrollTop = container.scrollTop();

//           if (
//             scrollToOffset === undefined ||
//             containerOffset === undefined ||
//             containerScrollTop === undefined
//           ) {
//             throw new Error("Unexpected undefined");
//           }

//           container.animate({
//             scrollTop: scrollToOffset.top - containerOffset.top + containerScrollTop,
//           });
//         }
//       } else {
//         container.scrollTop(0);
//       }
//     }
//   },
// });

export function Navbar() {
  const { t } = useTranslation();
  const status = useMeteorStatus();
  const currentRegion = useCurrentRegion();
  const siteName = useSiteName();
  const viewport = useViewportSize();
  const currentRouteName = useCurrentRouteName();
  const collapseRef = useRef<HTMLDivElement>(null);
  const { getLocalizedValue } = useLocalizedSetting();

  const isMobileScreen = viewport.width <= ScssVars.gridFloatBreakpoint;

  const [navbarIsCollapsed, setNavbarIsCollapsed] = useState(true);

  function headerLogo() {
    let headerLogo;

    if (currentRegion?.custom?.headerLogo?.src) {
      // the region has a custom logo
      headerLogo = currentRegion.custom.headerLogo.src;
    } else {
      // general logo
      headerLogo = PublicSettings.headerLogo.src;
    }

    if (headerLogo.startsWith("data:image/")) {
      // base64 image
      return headerLogo;
    }

    if (headerLogo.startsWith(PublicSettings.s3.publicUrlBase)) {
      // in our s3 file storage
      return headerLogo;
    }

    // in the openki repository folder "public/logo/"
    return `/logo/${headerLogo}`;
  }
  function headerAlt() {
    if (currentRegion?.custom?.headerLogo?.alt) {
      return currentRegion.custom.headerLogo.alt;
    }

    return PublicSettings.headerLogo.alt;
  }
  function siteStage() {
    if (currentRegion?.custom?.siteStage) {
      return currentRegion.custom.siteStage;
    }

    return PublicSettings.siteStage;
  }
  function links() {
    return PublicSettings.nav.customEntries.map((entry) => ({
      link: entry.link,
      icon: entry.icon,
      text: entry.key ? t(entry.key, { SITENAME: siteName }) : getLocalizedValue(entry.text),
    }));
  }
  function currentRouteIs(...routeNames: string[]) {
    return routeNames.includes(currentRouteName);
  }

  function close() {
    const collapseElement = collapseRef.current;
    if (!collapseElement) {
      throw new Error("Unexpected falsy: collapseElement");
    }

    Collapse.getInstance(collapseElement)?.hide();
  }

  useEventListener(collapseRef, "show.bs.collapse", () => {
    setNavbarIsCollapsed(false);
  });

  useEventListener(collapseRef, "hide.bs.collapse", () => {
    setNavbarIsCollapsed(true);
  });

  // closing the navbar when screen is made larger
  useLayoutEffect(() => {
    if (!isMobileScreen) {
      close();
    }
  }, [isMobileScreen]);

  return (
    <>
      <nav className={`navbar navbar-expand-lg fixed-top bg-brand`} data-bs-theme="dark">
        {PublicSettings.testWarning && <TestWarningTicker />}
        {/* Brand and toggle get grouped for better mobile display  */}
        <div className="navbar-container container-fluid">
          <a
            className="navbar-brand js-toggle-introduction me-4"
            href={PublicSettings.nav.brandLink}
            onClick={() => {
              close();
            }}
          >
            {status === "connected" ? (
              <img src={headerLogo()} alt={headerAlt()} />
            ) : status === "connecting" ? (
              <>
                <span
                  className="fa-solid fa-circle-notch fa-spin fa-fw connecting"
                  title={t("status.connecting", "Connecting to server")}
                ></span>
                <span className="sr-only">{t("status.connecting")}</span>
              </>
            ) : (
              <>
                {/* not connected */}
                <span
                  className="fa-solid fa-circle-notch fa-fw no-connection"
                  title={t("status.notConnected", "No connection to server")}
                ></span>
                <span className="sr-only">{t("status.notConnected")}</span>
              </>
            )}

            <span className="site-name">{siteName}</span>
            <span className="site-stage">{siteStage()}</span>
          </a>
          <button
            className="navbar-toggler collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#bs-navbar-collapse"
            aria-controls="bs-navbar-collapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <i className="fa-solid fa-bars text-white"></i>
            <i className="fa-solid fa-x text-white"></i>
          </button>
          <div ref={collapseRef} className="collapse navbar-collapse" id="bs-navbar-collapse">
            <ul className="navbar-nav flex-row me-auto mb-lg-0">
              {PublicSettings.nav.search && (
                <li className="nav-item text-center col col-lg-auto">
                  <a
                    href={Router.path("search")}
                    className={`${currentRouteIs("search", "showCourse") ? "active" : ""} nav-link`}
                    onClick={() => close()}
                  >
                    <span className="fa-regular fa-lightbulb fa-fw" aria-hidden="true" />
                    {t("menue.Courses", "Find")}
                    <div className="nav-marker-caret"></div>
                  </a>
                </li>
              )}
              {PublicSettings.nav.proposeCourse && (
                <li className="nav-item text-center col col-lg-auto">
                  <a
                    href={Router.path("proposeCourse")}
                    className={`${currentRouteIs("proposeCourse", "createEvent") ? "active" : ""} nav-link `}
                    onClick={() => close()}
                  >
                    <span className="fa-solid fa-pencil fa-fw" aria-hidden="true" />
                    {t("menue.Create", "Create")}
                    <div className="nav-marker-caret"></div>
                  </a>
                </li>
              )}
              {PublicSettings.nav.calendar && (
                <li className="nav-item text-center col col-lg-auto">
                  <a
                    href={Router.path("calendar")}
                    className={`${currentRouteIs("calendar") ? "active" : ""} nav-link calendar-link`}
                    onClick={() => close()}
                  >
                    <span className="fa-regular fa-calendar-days fa-fw" aria-hidden="true" />
                    {t("menue.Calendar", "Calendar")}
                    <div className="nav-marker-caret"></div>
                    <div className="nav-marker-bar"></div>
                  </a>
                </li>
              )}
              {links().map((link) => (
                <li key={link.link} className="nav-item text-center col col-lg-auto">
                  <a href={link.link} className="nav-link" onClick={() => close()}>
                    <span className={`${link.icon} fa-fw`} aria-hidden="true"></span>
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
            <ul className="navbar-nav flex-row" data-bs-theme="light">
              <RegionSelectionWrap
                inNavbar
                onSelect={() => {
                  close();
                }}
              />
              <LanguageSelection
                inNavbar
                onSelect={() => {
                  close();
                }}
              />
            </ul>
            <ul className="navbar-nav text-center" data-bs-theme="light">
              <li className="dropdown login-link">
                <LoginButton />
                <div className="dropdown-menu dropdown-menu-end login-dropdown">
                  <UserFrame />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div
        className={`navbar-custom-modal ${navbarIsCollapsed ? "d-none" : ""}`}
        onClick={() => close()}
      ></div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("Navbar", () => Navbar);

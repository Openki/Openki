import React, { useLayoutEffect, useRef, useState } from "react";
import { Router } from "meteor/iron:router";
import { useLocalizedSetting } from "/imports/utils/getLocalizedValue";

import { useEventListener } from "/imports/utils/useEventListener";
import { ScssVars } from "/imports/ui/lib/scss-vars";
import { useViewportSize } from "/imports/ui/hooks/useViewportSize";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { useTranslation } from "react-i18next";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";
import { useCurrentRouteName } from "/imports/ui/hooks/react-meteor-router";
import { useMeteorStatus } from "/imports/ui/hooks/react-meteor-data";
import { useSiteName } from "/imports/utils/getSiteName";
import { Introduction } from "../../lib/introduction";
import { cx } from "/imports/utils/cx";

import { Collapse } from "/imports/startup/client/bootstrap";
import { RegionSelectWrap } from "../regions/select";
import { LanguageSelection } from "/imports/ui/components/language-selection";
import { TestWarningTicker } from "./TestWarningTicker";
import { UserFrame } from "./user-frame";
import { LoginButton } from "./LoginButton";

import "./styles.scss";

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
    return (
      getLocalizedValue(currentRegion?.custom?.headerLogo?.alt) ||
      getLocalizedValue(PublicSettings.headerLogo.alt)
    );
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
      text: getLocalizedValue(entry.key || entry.text, { SITENAME: siteName }),
    }));
  }
  function currentRouteIs(...routeNames: string[]) {
    return routeNames.includes(currentRouteName);
  }

  function close() {
    if (collapseRef.current) {
      Collapse.getInstance(collapseRef.current)?.hide();
    } else {
      console.error("Unexpected falsy: collapseRef.current");
    }
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
      <nav className="navbar navbar-expand-lg fixed-top bg-brand">
        {PublicSettings.testWarning && <TestWarningTicker />}
        {/* Brand and toggle get grouped for better mobile display  */}
        <div className="navbar-container container-fluid">
          <a
            className="navbar-brand me-4"
            href={PublicSettings.nav.brandLink}
            onClick={() => {
              // Clicks on the logo toggle the intro blurb, but only when already on home
              if (currentRouteName === "home") {
                Introduction.showIntro();
              }

              close();
            }}
          >
            {status === "connected" ? (
              <img src={headerLogo()} alt={headerAlt()} />
            ) : status === "connecting" ? (
              <>
                <span
                  className="fa-solid fa-circle-notch fa-spin fa-fw connecting text-white"
                  title={t("status.connecting", "Connecting to server")}
                />
                <span className="sr-only">{t("status.connecting")}</span>
              </>
            ) : (
              <>
                {/* not connected */}
                <span
                  className="fa-solid fa-circle-notch fa-fw no-connection text-white"
                  title={t("status.notConnected", "No connection to server")}
                />
                <span className="sr-only">{t("status.notConnected")}</span>
              </>
            )}

            <span className="site-name text-white">{siteName}</span>
            <span className="site-stage">{siteStage()}</span>
          </a>
          <button
            data-test="navbar-toggler"
            className="navbar-toggler collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#bs-navbar-collapse"
            aria-controls="bs-navbar-collapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <i className="fa-solid fa-bars text-white" />
            <i className="fa-solid fa-x text-white" />
          </button>
          <div ref={collapseRef} className="collapse navbar-collapse" id="bs-navbar-collapse">
            <ul className="navbar-nav flex-row me-auto mb-lg-0">
              {PublicSettings.nav.search && (
                <li className="nav-item text-center col col-lg-auto">
                  <a
                    href={Router.path("search")}
                    className={cx(
                      "nav-link text-white",
                      currentRouteIs("search", "showGroup") && "active",
                    )}
                    onClick={() => close()}
                  >
                    <i className="fa-regular fa-lightbulb fa-fw" /> {t("menue.Groups", "Find")}
                    <div className="nav-marker-caret"></div>
                  </a>
                </li>
              )}
              {PublicSettings.nav.proposeGroup && (
                <li className="nav-item text-center col col-lg-auto">
                  <a
                    href={Router.path("proposeGroup")}
                    className={cx(
                      "nav-link text-white",
                      currentRouteIs("proposeGroup", "createEvent") && "active",
                    )}
                    onClick={() => close()}
                  >
                    <i className="fa-solid fa-pencil fa-fw" /> {t("menue.Create", "Create")}
                    <div className="nav-marker-caret"></div>
                  </a>
                </li>
              )}
              {PublicSettings.nav.calendar && (
                <li className="nav-item text-center col col-lg-auto">
                  <a
                    href={Router.path("calendar")}
                    className={cx(
                      "nav-link calendar-link text-white",
                      currentRouteIs("calendar") && "active",
                    )}
                    onClick={() => close()}
                  >
                    <i className="fa-regular fa-calendar-days fa-fw" />{" "}
                    {t("menue.Calendar", "Calendar")}
                    <div className="nav-marker-caret"></div>
                    <div className="nav-marker-bar"></div>
                  </a>
                </li>
              )}
              {links().map((link) => (
                <li key={link.link} className="nav-item text-center col col-lg-auto">
                  <a href={link.link} className="nav-link text-white" onClick={() => close()}>
                    <i className={cx(link.icon, "fa-fw")} /> {link.text}
                  </a>
                </li>
              ))}
            </ul>
            <ul className="navbar-nav flex-row">
              <RegionSelectWrap
                className="nav-item text-center col col-lg-auto"
                autoFocus
                size="small"
                onSelect={() => close()}
              />
              <LanguageSelection
                inNavbar
                onSelect={() => {
                  close();
                }}
              />
            </ul>
            <ul className="navbar-nav text-center">
              <li className="dropdown login-link">
                <LoginButton />
                <div className="dropdown-menu dropdown-menu-end login-dropdown">
                  <UserFrame onClose={close} />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div
        className={cx("navbar-custom-modal", navbarIsCollapsed && "d-none")}
        onClick={() => close()}
      ></div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("Navbar", () => Navbar);

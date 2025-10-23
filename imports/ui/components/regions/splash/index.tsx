import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { RegionSelection } from "../selection/selection";

import { Modal } from "/imports/startup/client/bootstrap";

import { useSiteName } from "/imports/utils/getSiteName";

import "./styles.scss";

export function Splash() {
  const { t } = useTranslation();
  const elementRef = useRef<HTMLDivElement>(null);
  const siteName = useSiteName();

  function handelHidden() {
    Session.set("showRegionSplash", false);
  }

  useEffect(() => {
    if (!elementRef.current) {
      return undefined;
    }

    Modal.getOrCreateInstance(elementRef.current).show();

    const element = elementRef.current;
    element.addEventListener("hidden.bs.modal", handelHidden);

    return () => {
      element.removeEventListener("hidden.bs.modal", handelHidden);
    };
  });

  return (
    <div className="modal regions-splash" ref={elementRef} tabIndex={-1} role="dialog">
      <div className="modal-dialog modal-sm" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">
              {t("regionsSplash.welcome", "Welcome to {SITE}!", { SITE: siteName })}
            </h4>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <h5 className="regions-splash-header">
              {t("regionsSplash.plsChooseRegion", "Please choose a region")}
            </h5>
            <div className="regions-splash-selection">
              <RegionSelection
                isSplash={true}
                onSelect={() => {
                  if (!elementRef.current) {
                    return;
                  }
                  Modal.getOrCreateInstance(elementRef.current).hide();
                }}
              />
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  if (!elementRef.current) {
                    return;
                  }
                  Modal.getOrCreateInstance(elementRef.current).hide();
                }}
              >
                {t("regionSplash.ok", "Go!")}
              </button>
            </div>
            <div className="regions-splash-login">
              <button
                className="btn btn-link"
                type="button"
                onClick={() => {
                  if (!elementRef.current) {
                    return;
                  }
                  Modal.getOrCreateInstance(elementRef.current).hide();
                  Session.set("pleaseLogin", true);
                }}
              >
                {t("regionsSplash.login", "Log in to use your last selected region")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("RegionSplash", () => Splash);

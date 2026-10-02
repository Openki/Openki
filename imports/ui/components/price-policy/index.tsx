import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import React from "react";
import { useTranslation } from "react-i18next";
import { useTracker } from "meteor/react-meteor-data";

import { useSessionEquals, useUser } from "/imports/ui/hooks/react-meteor-data";
import { cx } from "/imports/utils/cx";
import * as Analytics from "/imports/ui/lib/analytics";
import { useLocalizedSetting } from "/imports/utils/getLocalizedValue";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { getSiteName } from "/imports/utils/getSiteName";

import * as usersMethods from "/imports/api/users/methods";
import { Regions } from "/imports/api/regions/regions";

import "./styles.scss";

function Disclaimer() {
  const { t } = useTranslation();
  const siteName = useTracker(() => getSiteName(Regions.currentRegion()));

  return (
    <div className="icon-text">
      <div className="icon-text-icon">
        <i className="fa-solid fa-info fa-fw" />
      </div>
      <div className="icon-text-text">
        {t(
          "pricePolicy.disclaimer",
          "Education should be open to everyone. That's why {SITENAME} only allows suggested/orientation prices.",
          { SITENAME: siteName },
        )}
      </div>
    </div>
  );
}
function More() {
  const { t } = useTranslation();
  const { getLocalizedValue } = useLocalizedSetting();

  return (
    <a href={getLocalizedValue(PublicSettings.pricePolicyLink)} className="icon-text">
      <div className="icon-text-icon">
        <i className="fa-solid fa-book fa-fw" />
      </div>
      <div className="icon-text-text">
        {t("pricePolicy.moreAboutPricePolicy", "Read our pricing policy")}
      </div>
    </a>
  );
}
async function handleHideClick() {
  Session.set("hidePricePolicy", true);
  try {
    localStorage.setItem("hidePricePolicy", "true"); // Note: At July 2021, only string values were allowed.
  } catch {
    // ignore See: https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem#exceptions
  }

  // if logged in, hide the policy permanently for this user
  if (Meteor.userId()) {
    await usersMethods.hidePricePolicy();
  }

  Analytics.trackEvent("price", "hide policy");
}

function Dismissible() {
  const { t } = useTranslation();
  return (
    <a href="#" onClick={handleHideClick} className="icon-text">
      <div className="icon-text-icon">
        <i className="fa-solid fa-ban fa-fw" />
      </div>
      <div className="icon-text-text">
        {t("pricePolicy.dontShowAnymore", "Don't show this anymore")}
      </div>
    </a>
  );
}

interface Props {
  dismissible?: boolean | undefined;
  wrap?: string | undefined;
}

function useDismissed() {
  const hidePricePolicy = useSessionEquals("hidePricePolicy", true);
  const user = useUser();

  if (hidePricePolicy) {
    return true;
  }

  if (localStorage?.getItem("hidePricePolicy") === "true") {
    return true;
  }

  if (user) {
    return true;
  }

  return false;
}

function useShown(props: Props) {
  const dismissed = useDismissed();

  if (!PublicSettings.pricePolicyEnabled) {
    return false;
  }

  if (props.dismissible) {
    return !dismissed;
  }
  return true;
}

function Content(props: { dismissible?: boolean | undefined }) {
  if (props.dismissible) {
    return (
      <>
        <div>
          <Disclaimer />
        </div>
        <div className="row g-2 mt-1">
          <div className="col-12 col-sm-6">
            <More />
          </div>
          <div className="col-12 col-sm-6">
            <Dismissible />
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="d-lg-inline-block">
        <Disclaimer />
      </div>{" "}
      <div className="d-lg-inline-block">
        <More />
      </div>
    </>
  );
}

export function PricePolicy(props: Props) {
  if (!useShown(props)) {
    return null;
  }

  return (
    <div className={cx("price-policy", props.wrap, props.dismissible && "is-dismissible")}>
      <div className="price-policy-content">
        <Content dismissible={props.dismissible} />
      </div>
    </div>
  );
}

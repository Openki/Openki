import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import React from "react";
import { Template } from "meteor/templating";
import { useTranslation } from "react-i18next";
import { useTracker } from "meteor/react-meteor-data";
import { useSessionEquals, useUser } from "/imports/utils/react-meteor-data";

import * as usersMethods from "/imports/api/users/methods";
import { Regions } from "/imports/api/regions/regions";

import * as Analytics from "/imports/ui/lib/analytics";
import { useLocalizedSetting } from "/imports/utils/getLocalizedValue";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { getSiteName } from "/imports/utils/getSiteName";

import "./styles.scss";

function Disclaimer() {
  const { t } = useTranslation();
  const siteName = useTracker(() => getSiteName(Regions.currentRegion()));

  return (
    <div className="icon-text">
      <div className="icon-text-icon">
        <i className="fa-solid fa-info fa-fw" aria-hidden="true"></i>
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
    <a href={getLocalizedValue(PublicSettings.pricePolicyLink)}>
      <div className="icon-text">
        <div className="icon-text-icon">
          <i className="fa-solid fa-book fa-fw" aria-hidden="true"></i>
        </div>
        <div className="icon-text-text">
          {t("pricePolicy.moreAboutPricePolicy", "Read our price policy")}
        </div>
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

function Dismissable() {
  const { t } = useTranslation();
  return (
    <a href="#" onClick={handleHideClick}>
      <div className="icon-text">
        <div className="icon-text-icon">
          <i className="fa-solid fa-ban fa-fw" aria-hidden="true"></i>
        </div>
        <div className="icon-text-text">
          {t("pricePolicy.dontShowAnymore", "Don't show this anymore")}
        </div>
      </div>
    </a>
  );
}

interface Props {
  dismissable?: boolean | undefined;
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

  if (props.dismissable) {
    return !dismissed;
  }
  return true;
}

function Content(props: { dismissable?: boolean | undefined }) {
  if (props.dismissable) {
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
            <Dismissable />
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

function classNames(props: Props) {
  const classes = [];
  if (props.dismissable) {
    classes.push("is-dismissable");
  }
  if (props.wrap) {
    classes.push(props.wrap);
  }
  return classes.join(" ");
}

export function PricePolicy(props: Props) {
  if (!useShown(props)) {
    return null;
  }

  return (
    <div className={`price-policy ${classNames(props)}`}>
      <div className="price-policy-content">
        <Content dismissable={props.dismissable} />
      </div>
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("PricePolicy", () => PricePolicy);

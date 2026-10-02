import { useTranslation } from "react-i18next";
import React from "react";
import { Template } from "meteor/templating";

import { PublicSettings } from "/imports/utils/PublicSettings";
import {
  Introduction as IntroductionUtil,
  useOpenedIntro,
  useShownIntro,
} from "/imports/ui/lib/introduction";
import { getSiteName } from "/imports/utils/getSiteName";
import { useLocalizedSetting } from "/imports/utils/getLocalizedValue";
import { PricePolicy } from "/imports/ui/components/price-policy";
import { useCurrentRouteName } from "/imports/ui/hooks/react-meteor-router";
import { cx } from "/imports/utils/cx";

import "./styles.scss";

export interface Props {
  hasPricePolicy: boolean;
}

export function Introduction({ hasPricePolicy }: Props) {
  const { t } = useTranslation();
  const { getLocalizedValue } = useLocalizedSetting();
  const routeName = useCurrentRouteName();
  const shownIntro = useShownIntro();
  const openedIntro = useOpenedIntro();

  function isInCalendar() {
    return routeName === "calendar";
  }

  if (!shownIntro) {
    return null;
  }

  return (
    <div className={cx("container", isInCalendar() && "calendar-introduction")}>
      <div className="introduction">
        <h3>
          <a
            href="#"
            onClick={() => {
              if (openedIntro) {
                IntroductionUtil.closeIntro();
              } else {
                IntroductionUtil.openIntro();
              }
            }}
          >
            {openedIntro ? (
              <i className="fa-solid fa-angle-up fa-fw" />
            ) : (
              <i className="fa-solid fa-angle-down fa-fw" />
            )}
            {t("introduction.Title", "What does {SITENAME} do for you?", {
              SITENAME: getSiteName(),
            })}
          </a>
          <a
            className="introduction-close-btn"
            href="#"
            title={t("introduction.close.title", "Close introduction")}
            onClick={() => {
              IntroductionUtil.doneIntro();
            }}
          >
            <span className="remove-btn fa-solid fa-xmark" />
          </a>
        </h3>
        {!!openedIntro && (
          <div className="introduction-content">
            <div className="introduction-steps row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-6">
              <div className="col">
                <h2>
                  <i className="fa-regular fa-lightbulb" />
                </h2>
                {t("introduction.1_teachOrLearn", "You want to learn something, or teach others.")}
              </div>
              <div className="col">
                <h2>
                  <i className="fa-solid fa-magnifying-glass" />
                </h2>
                {t(
                  "introduction.2_searchNPropose",
                  "You search if the group already exists. If not, just propose it.",
                )}
              </div>
              <div className="col">
                <h2>
                  <i className="fa-solid fa-graduation-cap" />
                </h2>
                {t(
                  "introduction.3_enroll",
                  "Everybody can join your group as participant, mentor or host.",
                )}
              </div>
              <div className="col">
                <h2>
                  <i className="fa-regular fa-calendar-check" />
                </h2>
                {t("introduction.4_schedule", "When everybody needed is in, a date gets fixed.")}
              </div>
              <div className="col">
                <h2>
                  <i className="fa-solid fa-rocket" />
                </h2>
                {t("introduction.5_takePlace", "The group meets and events take place.")}
              </div>
              <div className="col">
                <h2>
                  <i className="fa-solid fa-circle-info" />
                </h2>
                {t("introduction.more", "More info:")}
                <br />
                <a href={getLocalizedValue(PublicSettings.aboutLink)}>
                  {t("main.about_link", "About")}
                </a>
                <br />
                <a href={getLocalizedValue(PublicSettings.faqLink)}>{t("main.faq_link", "FAQ")}</a>
              </div>
            </div>
            {hasPricePolicy && <PricePolicy />}
          </div>
        )}
      </div>
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("Introduction", () => Introduction);

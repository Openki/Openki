import React from "react";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { getLocalizedValue } from "/imports/utils/getLocalizedValue";
import { useTranslation } from "react-i18next";
import { useSiteName } from "/imports/utils/getSiteName";

export function Guide() {
  const { t } = useTranslation();
  const siteName = useSiteName();

  return (
    <>
      <br />
      <br />
      <span>
        {t("course.roles.firstSteps.guide", "Further info")}:&nbsp;
        <a href={getLocalizedValue(PublicSettings.courseGuideLink)} target="_blank">
          {t("course.roles.firstSteps.guideLink", "How to organize my first {SITENAME} course?", {
            SITENAME: siteName,
          })}
        </a>
      </span>
    </>
  );
}

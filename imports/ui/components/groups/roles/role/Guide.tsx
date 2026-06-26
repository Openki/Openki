import React from "react";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { useLocalizedSetting } from "/imports/utils/getLocalizedValue";
import { useTranslation } from "react-i18next";
import { useSiteName } from "/imports/utils/getSiteName";

export function Guide() {
  const { t } = useTranslation();
  const siteName = useSiteName();
  const { getLocalizedValue } = useLocalizedSetting();

  return (
    <>
      {t("group.roles.firstSteps.guide", "Further info")}:&nbsp;
      <a href={getLocalizedValue(PublicSettings.groupGuideLink)} target="_blank" rel="noreferrer">
        {t("group.roles.firstSteps.guideLink", "How to organize my first {SITENAME} group?", {
          SITENAME: siteName,
        })}
      </a>
    </>
  );
}

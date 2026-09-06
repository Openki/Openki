import React from "react";
import { useTranslation } from "react-i18next";
import { OrganizationHeader } from "./OrganizationHeader";
import { useLocalizedSetting } from "/imports/utils/getLocalizedValue";
import { useSiteName } from "/imports/utils/getSiteName";
import { PublicSettings } from "/imports/utils/PublicSettings";

interface Props {
  groupId?: string | undefined;
  isFrame?: boolean | undefined;
  organization?: string | undefined;
}

export function Header({ groupId, isFrame, organization }: Props) {
  const { t } = useTranslation();
  const siteName = useSiteName();
  const { getLocalizedValue } = useLocalizedSetting();

  return groupId ? (
    <h2>{t("group.edit.editGroup", "Edit group")}</h2>
  ) : (
    !isFrame && (
      <>
        <h2>
          {organization ? (
            <OrganizationHeader organizationId={organization} />
          ) : (
            t("group.edit.propose", "Propose new group")
          )}
        </h2>
        <div className="icon-text">
          <div className="icon-text-icon">
            <i className="fa-solid fa-info fa-fw" />
          </div>
          <div className="icon-text-text">
            {t(
              "group.propose.GroupInfo",
              "Start your own {SITENAME} group here. Whether as a mentor or participant, you decide what and how you want to learn. More info here:",
              { SITENAME: siteName },
            )}{" "}
            <a
              href={getLocalizedValue(PublicSettings.groupGuideLink)}
              target="_blank"
              rel="noreferrer"
            >
              {t("group.propose.guideLink", "How to organize my first {SITENAME} group?", {
                SITENAME: siteName,
              })}
            </a>
            {", "}
            <a href={getLocalizedValue(PublicSettings.faqLink)} target="_blank" rel="noreferrer">
              {t("group.propose.faq", "FAQ")}
            </a>
          </div>
        </div>
      </>
    )
  );
}

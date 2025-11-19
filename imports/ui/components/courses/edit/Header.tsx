import React from "react";
import { useTranslation } from "react-i18next";
import { GroupHeader } from "./GroupHeader";
import { getLocalizedValue } from "/imports/utils/getLocalizedValue";
import { useSiteName } from "/imports/utils/getSiteName";
import { PublicSettings } from "/imports/utils/PublicSettings";

interface Props {
  _id?: string;
  isFrame?: boolean;
  group?: string;
}

export function Header({ _id, isFrame, group }: Props) {
  const { t } = useTranslation();
  const siteName = useSiteName();

  return _id ? (
    <h2>{t("course.edit.edit_course", "Edit course")}</h2>
  ) : !isFrame ? (
    <>
      <h2>
        {group ? <GroupHeader groupId={group} /> : t("course.edit.propose", "Propose new course")}
      </h2>
      <div className="icon-text">
        <div className="icon-text-icon">
          <i className="fa-solid fa-info fa-fw" aria-hidden="true"></i>
        </div>
        <div className="icon-text-text">
          {t(
            "course.propose.CourseInfo",
            "Start your own {SITENAME} course here. Whether as a mentor or participant, you decide what and how you want to learn. More info here:",
            { SITENAME: siteName },
          )}{" "}
          <a
            href={getLocalizedValue(PublicSettings.courseGuideLink)}
            target="_blank"
            rel="noreferrer"
          >
            {t("course.propose.guideLink", "How to organize my first {SITENAME} course?", {
              SITENAME: siteName,
            })}
          </a>
          {", "}
          <a href={getLocalizedValue(PublicSettings.faqLink)} target="_blank" rel="noreferrer">
            {t("course.propose.faq", "FAQ")}
          </a>
        </div>
      </div>
    </>
  ) : null;
}

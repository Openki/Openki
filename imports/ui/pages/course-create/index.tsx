import React from "react";
import { useTranslation } from "react-i18next";

import { MetaTags } from "/imports/ui/components/MetaTags";

import { Edit, Props } from "/imports/ui/components/courses/edit";

export function CourseProposePage(data: Props) {
  const { t } = useTranslation();

  return (
    <>
      <MetaTags title={t("course.propose.windowtitle", "Propose new course")} />

      <div className="container mw-md">
        <Edit {...data} />
      </div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("CourseProposePage", () => CourseProposePage);

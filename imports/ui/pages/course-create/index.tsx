import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import * as Metatags from "/imports/utils/metatags";

import { Edit } from "/imports/ui/components/courses/edit";

export function CourseProposePage() {
  const { t } = useTranslation();

  useEffect(() => {
    Metatags.setCommonTags(t("course.propose.windowtitle", "Propose new course"));
  });

  return (
    <div className="container mw-md">
      <Edit />
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("CourseProposePage", () => CourseProposePage);

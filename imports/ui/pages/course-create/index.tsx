import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import * as Metatags from "/imports/utils/metatags";

import { Data, Edit } from "/imports/ui/components/courses/edit";

export function CourseProposePage(data: Data) {
  const { t } = useTranslation();

  useEffect(() => {
    Metatags.setCommonTags(t("course.propose.windowtitle", "Propose new course"));
  });

  return (
    <div className="container mw-md">
      <Edit {...data} />
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("CourseProposePage", () => CourseProposePage);

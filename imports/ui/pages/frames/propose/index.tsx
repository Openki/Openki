import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import * as Metatags from "/imports/utils/metatags";

import { AccountTasks } from "/imports/ui/components/account-tasks";
import { Edit, Props } from "/imports/ui/components/courses/edit";

export function Propose(data: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    Metatags.setCommonTags(t("course.propose.windowtitle", "Propose new course"));
  });

  return (
    <>
      <AccountTasks />
      <Edit {...data} />
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("FrameProposePage", () => Propose);

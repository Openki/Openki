import React from "react";
import { useTranslation } from "react-i18next";

import { MetaTags } from "/imports/ui/components/MetaTags";

import { AccountTasks } from "/imports/ui/components/account-tasks";
import { Edit, Props } from "../../../components/groups/edit";

export function Propose(data: Props) {
  const { t } = useTranslation();

  return (
    <>
      <MetaTags title={t("group.propose.windowtitle", "Propose new group")} />

      <AccountTasks />
      <Edit {...data} />
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("FrameProposePage", () => Propose);

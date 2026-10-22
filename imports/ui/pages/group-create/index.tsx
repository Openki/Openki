import React from "react";
import { useTranslation } from "react-i18next";

import { MetaTags } from "/imports/ui/components/MetaTags";

import { Edit, Props } from "/imports/ui/components/groups/edit";

export function GroupProposePage(props: Props) {
  const { t } = useTranslation();

  return (
    <>
      <MetaTags title={t("group.propose.windowtitle", "Propose new group")} />

      <div className="container mw-md">
        <Edit {...props} showCancelButton />
      </div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("GroupProposePage", () => GroupProposePage);

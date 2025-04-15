import { useTranslation } from "react-i18next";
import React from "react";
import { Template } from "meteor/templating";

import * as JoinLinks from "/imports/api/joinLinks/methods";

export function JoinLinkCreate(props: { tenantId: string }) {
  const { t } = useTranslation();

  return (
    <button
      className="btn btn-add form-control"
      type="button"
      onClick={async () => {
        await JoinLinks.create(props.tenantId);
      }}
    >
      {t("joinLink.create", "Create invite link")}
    </button>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("JoinLinkCreate", () => JoinLinkCreate);

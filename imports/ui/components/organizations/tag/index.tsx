import React from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";

import { OrganizationModel } from "/imports/api/organizations/organizations";
import { useDetails } from "/imports/api/organizations/publications";

import { name } from "../../../lib/organization-name-helpers";
import { cx } from "/imports/utils/cx";

import "./styles.scss";

function short(organization: OrganizationModel | undefined) {
  return organization ? organization.short : "-";
}

export interface Props {
  organizationId: string;
  full?: boolean;
  isTeam?: boolean;
  onClick?: () => Promise<void>;
  onMouseOver?: () => Promise<void>;
  onMouseOut?: () => Promise<void>;
}

export function OrganizationTag({
  organizationId,
  full,
  isTeam,
  onMouseOver,
  onMouseOut,
  onClick,
}: Props) {
  const { t } = useTranslation();
  const [isLoading, organization] = useDetails(organizationId);

  return (
    <div
      data-test={`organization-tag-${organizationId}`}
      className={cx("fw-light tag tag-link organization-tag", isTeam && "organization-tag-is-team")}
    >
      {isLoading() ? (
        <span className="placeholder" style={{ width: full ? "100px" : "40px" }}></span>
      ) : (
        <a
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
          onClick={onClick}
          href={Router.path("organizationDetails", organization)}
          data-bs-title={t("organizationTag.showGroups", "Show all groups for {NAME}", {
            NAME: name(organization),
          })}
        >
          {full ? name(organization) : short(organization)}
        </a>
      )}
    </div>
  );
}

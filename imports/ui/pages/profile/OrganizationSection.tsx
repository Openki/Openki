import { Router } from "meteor/iron:router";
import React from "react";
import { useTranslation } from "react-i18next";
import { OrganizationTag } from "../../components/organizations/tag";
import { OrganizationModel } from "../../../api/organizations/organizations";

export function OrganizationSection({ organizations }: { organizations: OrganizationModel[] }) {
  const { t } = useTranslation();
  return (
    <div className="page-component page-component-seperated">
      <h3>{t("profile.groups", "My groups")}</h3>
      <p>
        {t(
          "profile.groupMembership",
          "You are {NUM_GROUPS, plural, =0{not member of any group} one{member of the group:} other{member of # groups:} }",
          {
            NUM_GROUPS: organizations.length,
          },
        )}
      </p>
      <ul className="list-unstyled">
        {organizations.map((organization) => (
          <li key={organization._id} className="mb-3">
            <OrganizationTag organizationId={organization._id} full={true} />
          </li>
        ))}
      </ul>
      <a
        className="btn btn-add"
        href={Router.path("groupDetails", {
          _id: "create",
        })}
      >
        {t("profile.createNewGroup.button", "Create a new group")}
      </a>
    </div>
  );
}

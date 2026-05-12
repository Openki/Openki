import { Router } from "meteor/iron:router";
import React from "react";
import { useTranslation } from "react-i18next";
import { OrganizationTag } from "../../components/organizations/tag";
import { OrganizationModel } from "../../../api/organizations/organizations";

export function OrganizationSection({ organizations }: { organizations: OrganizationModel[] }) {
  const { t } = useTranslation();
  return (
    <div className="page-component page-component-seperated">
      <h3>{t("profile.organizations", "My organizations")}</h3>
      <p>
        {t(
          "profile.organizationMembership",
          "You are {NUM_ORGANIZATIONS, plural, =0{not member of any organization} one{member of the organization:} other{member of # organizations:} }",
          {
            NUM_ORGANIZATIONS: organizations.length,
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
        href={Router.path("organizationDetails", {
          _id: "create",
        })}
      >
        {t("profile.createNewOrganization.button", "Create a new organization")}
      </a>
    </div>
  );
}

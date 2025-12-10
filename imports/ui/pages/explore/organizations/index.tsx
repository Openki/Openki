import React from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";

import * as Organizations from "../../../../api/organizations/publications";

import { MetaTags } from "/imports/ui/components/MetaTags";

import "./styles.scss";

function bodyStyle(imageUrl: string) {
  const src = imageUrl;
  if (!src) {
    return {};
  }

  return {
    backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.75)), url('${src}')`,
    backgroundPosition: "center",
    backgroundSize: "cover",
  };
}

export function OrganizationsPage() {
  const { t } = useTranslation();

  const [isLoading, organizations] = Organizations.useFindFilter();

  if (isLoading()) {
    return null;
  }

  return (
    <>
      <MetaTags title={t("exploreGroups.title", "Groups")} />

      <div className="container">
        <div className="row gap-0 row-gap-4 row row-cols-2 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">
          {organizations.map((organization) => (
            <div key={organization._id} className="col">
              <div
                className="card card-group border-0 rounded-0 mx-auto"
                style={bodyStyle(organization.publicLogoUrl())}
              >
                <div className="card-body overflow-hidden">
                  <h5 className="card-title">
                    <a className="stretched-link" href={Router.path("groupDetails", organization)}>
                      {organization.name}
                    </a>
                  </h5>
                  <p className="card-text">{organization.claim}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("ExploreGroupsPage", () => OrganizationsPage);

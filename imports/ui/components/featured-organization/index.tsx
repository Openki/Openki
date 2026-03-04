import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import React from "react";
import { Template } from "meteor/templating";

import { useDetails } from "../../../api/organizations/publications";

import { useCurrentRegion } from "/imports/utils/useCurrentRegion";
import { useSiteName } from "/imports/utils/getSiteName";

import "./styles.scss";

function FeaturedOrganizationBody(props: { organizationId: string }) {
  const { t } = useTranslation();

  const siteName = useSiteName();

  const [featuredOrganizationIsLoading, featuredOrganization] = useDetails(props.organizationId);

  if (featuredOrganizationIsLoading() || !featuredOrganization) {
    return null;
  }

  return (
    <div className="featured-group-body">
      {!!featuredOrganization.logoUrl && (
        <div className="featured-group-body-logo">
          <img className="featured-group-logo" src={featuredOrganization.publicLogoUrl()} />
        </div>
      )}

      <div className="featured-group-body-content">
        <div className="featured-group-name">
          {featuredOrganization.name} ({featuredOrganization.short})
        </div>
        <div className="featured-group-links">
          <a href={Router.path("groupDetails", featuredOrganization)}>
            {t(
              "featuredOrganization.coursesOnOpenki",
              "Check out the courses of {ORGANIZATION} on {SITENAME}!",
              {
                ORGANIZATION: featuredOrganization.name,
                SITENAME: siteName,
              },
            )}
          </a>
        </div>
      </div>
    </div>
  );
}

export function FeaturedOrganization() {
  const { t } = useTranslation();

  const currentRegion = useCurrentRegion();

  if (!currentRegion || !currentRegion.featuredGroup) {
    return null;
  }

  return (
    <div className="container">
      <div className="featured-group">
        <div className="featured-group-header">
          <i className="fa-solid fa-star fa-fw" />{" "}
          {t("featuredOrganization.heading", "Featured organization in {REGION}", {
            REGION: currentRegion.name,
          })}
        </div>
        <FeaturedOrganizationBody organizationId={currentRegion.featuredGroup} />
      </div>
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("FeaturedGroup", () => FeaturedOrganization);

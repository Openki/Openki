import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import React from "react";
import { Template } from "meteor/templating";

import { useDetails } from "/imports/api/organizations/publications";

import { useCurrentRegion } from "/imports/ui/hooks/useCurrentRegion";
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
    <div className="featured-organization-body">
      {!!featuredOrganization.logoUrl && (
        <div className="featured-organization-body-logo">
          <img
            className="featured-organization-logo"
            src={featuredOrganization.publicLogoUrl()}
            alt={`${featuredOrganization.name} logo`}
          />
        </div>
      )}

      <div className="featured-organization-body-content">
        <div className="featured-organization-name">
          {featuredOrganization.name} ({featuredOrganization.short})
        </div>
        <div className="featured-organization-links">
          <a href={Router.path("organizationDetails", featuredOrganization)}>
            {t(
              "featuredOrganization.groupsOnOpenki",
              "Check out the groups of {ORGANIZATION} on {SITENAME}!",
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

  if (!currentRegion || !currentRegion.featuredOrganization) {
    return null;
  }

  return (
    <div className="container">
      <div className="featured-organization">
        <div className="featured-organization-header">
          <i className="fa-solid fa-star fa-fw" />{" "}
          {t("featuredOrganization.heading", "Featured organization in {REGION}", {
            REGION: currentRegion.name,
          })}
        </div>
        <FeaturedOrganizationBody organizationId={currentRegion.featuredOrganization} />
      </div>
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("FeaturedOrganization", () => FeaturedOrganization);

import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import React from "react";
import { Template } from "meteor/templating";

import { useDetails } from "/imports/api/groups/publications";

import { useCurrentRegion } from "/imports/utils/useCurrentRegion";
import { useSiteName } from "/imports/utils/getSiteName";

import "./styles.scss";

function FeaturedGroupBody(props: { groupId: string }) {
  const { t } = useTranslation();

  const siteName = useSiteName();

  const [featuredGroupIsLoading, featuredGroup] = useDetails(props.groupId);

  if (featuredGroupIsLoading() || !featuredGroup) {
    return null;
  }

  return (
    <div className="featured-group-body">
      {!!featuredGroup.logoUrl && (
        <div className="featured-group-body-logo">
          <img className="featured-group-logo" src={featuredGroup.publicLogoUrl()} />
        </div>
      )}

      <div className="featured-group-body-content">
        <div className="featured-group-name">
          {featuredGroup.name} ({featuredGroup.short})
        </div>
        <div className="featured-group-links">
          <a href={Router.path("groupDetails", { _id: featuredGroup._id })}>
            {t("featuredGroup.coursesOnOpenki", "Check out the courses of {GROUP} on {SITENAME}!", {
              GROUP: featuredGroup.name,
              SITENAME: siteName,
            })}
          </a>
        </div>
      </div>
    </div>
  );
}

export function FeaturedGroup() {
  const { t } = useTranslation();

  const currentRegion = useCurrentRegion();

  if (!currentRegion || !currentRegion.featuredGroup) {
    return null;
  }

  return (
    <div className="container">
      <div className="featured-group">
        <div className="featured-group-header">
          <span className="fa-solid fa-star fa-fw" aria-hidden="true"></span>{" "}
          {t("featuredGroup.heading", "Featured group in {REGION}", {
            REGION: currentRegion.name,
          })}
        </div>
        <FeaturedGroupBody groupId={currentRegion.featuredGroup} />
      </div>
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("FeaturedGroup", () => FeaturedGroup);

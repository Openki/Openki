import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useCurrentRegionId, useFeaturedGroup } from "/imports/utils/useCurrentRegion";
import * as Metatags from "/imports/utils/metatags";

import { Dashboard } from "/imports/ui/components/dashboard";

export function DashboardPage() {
  const { t } = useTranslation();
  const featuredGroup = useFeaturedGroup();
  const region = useCurrentRegionId();

  const list = [
    {
      entity: "course",
      title: featuredGroup?.name ?? "",
      query: `${region ? `region=${region}&` : ""}group=${featuredGroup?._id}`,
      showAll: { link: `/group/${featuredGroup?._id}` },
    },
    {
      entity: "course",
      title: t("explore.recentActivities.title", "Recent activities"),
      query: `${region ? `region=${region}&` : ""}internal=0`,
    },
    {
      entity: "event",
      title: t("explore.upcomingEvents.title", "Upcoming events"),
      query: `${region ? `region=${region}&` : ""}after=now&sort=start&internal=0&canceled=0`,
    },
    {
      entity: "course",
      title: t("explore.newProposals.title", "New proposals"),
      query: `${region ? `region=${region}&` : ""}state=proposal&internal=0&sort=-time_created`,
    },
    {
      entity: "course",
      title: t("explore.lookingForMentors.title", "Looking for mentors"),
      query: `${
        region ? `region=${region}&` : ""
      }needsRole=mentor&state=proposal,resting&internal=0`,
    },
    {
      entity: "course",
      title: t("explore.lookingForVenues.title", "Looking for venues"),
      query: `${region ? `region=${region}&` : ""}needsRole=host&state=proposal,resting&internal=0`,
    },
    {
      entity: "course",
      title: "ASZ",
      query: `${region ? `region=${region}&` : ""}group=b0f1a82d36`,
      showAll: { link: "/group/b0f1a82d36/ASZ" },
    },
    {
      entity: "group",
      title: t("explore.activeGroups.title", "Active groups"),
      query: "",
    },
    {
      entity: "eventsMap",
      title: t("explore.eventsMap.title", "Events map"),
      query: "after=now",
    },
  ];

  useEffect(() => {
    Metatags.setCommonTags(t("dashboard.title", "Dashboard"));
  });

  return <Dashboard list={list} />;
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("DashboardPage", () => DashboardPage);

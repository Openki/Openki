import React from "react";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";

import { PublicSettings } from "/imports/utils/PublicSettings";
import { useDetails } from "/imports/api/organizations/publications";

import { MetaTags } from "/imports/ui/components/MetaTags";
import { Dashboard } from "/imports/ui/components/dashboard";
import { Find } from "/imports/ui/components/groups/find";
import { NotFound } from "/imports/ui/pages/not-found";
import { LoadingPage } from "/imports/ui/pages/loading";

export interface Props {
  organizationId: string;
  groupQuery: Record<string, string | undefined> & {
    organization: string;
    region: string | undefined;
  };
}

export function KioskDashboardPage({ organizationId, groupQuery }: Props) {
  const region = useCurrentRegion();
  const [isLoading, organization] = useDetails(organizationId);

  if (isLoading()) {
    return <LoadingPage />;
  }

  if (!organization) {
    return <NotFound />;
  }

  const dashboardAttr = {
    list: organization.dashboard || PublicSettings.organizationDashboardDefault || [],
    defaultRegion: region?._id || "",
    defaultOrganization: organization._id,
  };

  return (
    <>
      <MetaTags
        title={organization.name}
        description={organization.claim}
        image={organization.publicLogoUrl()}
      />

      <div className="container my-3">
        <div className="d-flex">
          <div className="flex-grow-1">
            <h1>{organization.name}</h1>
            <p className="lead" dangerouslySetInnerHTML={{ __html: organization.description }} />
          </div>
          {organization.publicLogoUrl() && (
            <div style={{ width: "100px", height: "100px" }}>
              <img
                className="ms-3"
                style={{ maxWidth: "100%", maxHeight: "100%" }}
                src={organization.publicLogoUrl()}
                alt={organization.name}
              />
            </div>
          )}
        </div>
      </div>

      {dashboardAttr.list.length ? (
        <div className="pb-4">
          <Dashboard {...dashboardAttr} />
        </div>
      ) : (
        <div className="container pb-4">
          <Find query={groupQuery} />
        </div>
      )}
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("KioskDashboardPage", () => KioskDashboardPage);

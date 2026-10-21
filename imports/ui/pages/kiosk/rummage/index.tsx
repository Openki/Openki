import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { FindParams } from "/imports/api/groups/groups";
import { useFindFilter } from "/imports/api/groups/publications";
import { useDetails } from "/imports/api/organizations/publications";

import { useCurrentRegionId } from "/imports/ui/hooks/useCurrentRegion";
import { useSearchParams } from "/imports/ui/hooks/react-meteor-router";
import { SortSpec } from "/imports/utils/sort-spec";
import { Filtering } from "/imports/utils/filtering";
import { CssFromQuery } from "/imports/ui/lib/css-from-query";
import { cx } from "/imports/utils/cx";

import { MetaTags } from "/imports/ui/components/MetaTags";
import { LoadingPage } from "/imports/ui/pages/loading";
import { AccountTasks } from "/imports/ui/components/account-tasks";
import { GroupCompact } from "/imports/ui/components/groups/compact.modern";
import { CompactPropose } from "/imports/ui/components/groups/compact.modern.propose";
import { Button } from "/imports/ui/components/Buttons";

import "./styles.scss";

export function OrganizationDetails({ organizationId }: { organizationId?: string | undefined }) {
  const [isLoading, organization] = useDetails({ when: !!organizationId }, organizationId);

  if (isLoading() || !organization) {
    return null;
  }

  const organizationLogoUrl = organization.publicLogoUrl();

  return (
    <>
      <MetaTags
        title={organization.name}
        description={organization.claim}
        image={organizationLogoUrl}
      />
      <div className="d-flex gap-3">
        <div className="flex-grow-1">
          {organizationLogoUrl && (
            <img
              className="float-end"
              style={{ maxWidth: "150px" }}
              src={organizationLogoUrl}
              alt={organization.name}
            />
          )}
          <h1>{organization.name}</h1>
          <p className="lead" dangerouslySetInnerHTML={{ __html: organization.description }} />
        </div>
      </div>
    </>
  );
}

export function KioskRummagePage() {
  const { t } = useTranslation();

  const [sorted, setSorted] = useState(false);
  const [animated, setAnimated] = useState(false);

  let query = useSearchParams();
  const style = new CssFromQuery(query).getCssRules();
  const region = useCurrentRegionId();
  query = { ...query, region };

  const filter = new Filtering(FindParams).read(query);
  const count = Number.parseInt(query.count || "", 10) || 100;
  const sort = query.sort ? SortSpec.fromString(query.sort) : SortSpec.unordered();
  const [isLoading, groups] = useFindFilter(filter.toQuery(), count, undefined, sort.spec());

  if (isLoading()) {
    return <LoadingPage />;
  }

  return (
    <>
      <style>{style}</style>
      <div
        className="position-relative"
        style={{
          /* special case for draggable: 86400000 is the top z-index over all cards and +1 over a open panel */
          zIndex: 86400001,
        }}
      >
        <AccountTasks />
      </div>
      <div className="container-fluid">
        <div className="row">
          <div
            className={cx(
              "col-8 d-flex align-content-baseline flex-wrap gap-3 justify-content-center rummage position-relative py-3",
              sorted && "sorted",
              animated && "animated",
            )}
          >
            <CompactPropose organization={filter.get("organization")} draggable />
            {groups.map((group) => (
              <GroupCompact key={group._id} group={group} draggable />
            ))}
          </div>
          <div className="col-4 py-3">
            <OrganizationDetails organizationId={filter.get("organization")} />

            <div className="d-flex justify-content-center mt-5">
              <Button
                className="btn-primary fs-1 rounded-pill px-4"
                size="large"
                id="rummage-sort-btn"
                onClick={() => {
                  if (sorted) {
                    setTimeout(() => {
                      setAnimated(false);
                    }, 500);
                  } else {
                    setAnimated(true);
                  }
                  setSorted(!sorted);
                }}
              >
                {sorted
                  ? t("rummagePage.sortBtn.shuffle", "Shuffle")
                  : t("rummagePage.sortBtn.sort", "Sort")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("KioskRummagePage", () => KioskRummagePage);

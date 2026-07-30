import React from "react";

import { FindParams } from "/imports/api/groups/groups";
import { useFindFilter } from "/imports/api/groups/publications";

import { useCurrentRegionId } from "/imports/utils/useCurrentRegion";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { useSearchParams } from "/imports/utils/react-meteor-router";
import { SortSpec } from "/imports/utils/sort-spec";
import { useFiltering } from "/imports/utils/filtering";
import { CssFromQuery } from "/imports/ui/lib/css-from-query";

import { LoadingPage } from "/imports/ui/pages/loading";
import { AccountTasks } from "/imports/ui/components/account-tasks";
import { GroupCompact } from "/imports/ui/components/groups/compact.modern";
import { CompactPropose } from "/imports/ui/components/groups/CompactModernPropose";

export function KioskRummagePage() {
  let query = useSearchParams();
  const style = new CssFromQuery(query).getCssRules();
  const region = useCurrentRegionId();
  query = { ...query, region };

  const filter = useFiltering(FindParams, query);
  const sort = query.sort ? SortSpec.fromString(query.sort) : SortSpec.unordered();

  const [isLoading, groups] = useFindFilter(filter.asQuery, undefined, undefined, sort.spec());

  if (isLoading()) {
    return <LoadingPage />;
  }

  return (
    <>
      <MetaTags title="Rummage" />
      <style>{style}</style>
      <AccountTasks />
      <div className="container-fluid">
        <div className="d-flex align-items-stretch flex-wrap gap-3 justify-content-center">
          {groups.map((group, index) => (
            <React.Fragment key={group._id}>
              {/* The seventh box should always be the propose one, after then every 11 */}
              {PublicSettings.feature.proposeGroupBox && (index - 6) % 10 === 0 && (
                <CompactPropose />
              )}
              <GroupCompact group={group} />
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}

// for Blaze

import "./template.html";
import { MetaTags } from "/imports/ui/components/MetaTags";

Template.registerHelper("KioskRummagePage", () => KioskRummagePage);

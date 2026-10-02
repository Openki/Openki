import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "/imports/ui/hooks/react-meteor-router";
import { take } from "lodash-es";

import { Groups, FindFilter } from "/imports/api/groups/groups";

import { MetaTags } from "/imports/ui/components/MetaTags";
import { CssFromQuery } from "/imports/ui/lib/css-from-query";
import { SortSpec } from "/imports/utils/sort-spec";

import { LoadingRow } from "../../loading";
import { useFindFilter } from "/imports/api/groups/publications";
import { Group } from "./group";

function useOptions() {
  const query = useSearchParams();

  const filter = Groups.Filtering().read(query);
  const filterQuery: FindFilter = filter.toQuery();
  // Show internal groups only when a organization is specified
  if (!filterQuery.organization && filterQuery.internal === undefined) {
    filterQuery.internal = false;
  }

  const count = Number.parseInt(query.count || "", 10) || 200;

  const sort = query.sort ? SortSpec.fromString(query.sort) : SortSpec.unordered();

  const hideInterested = !!Number.parseInt(query.hideInterested || "", 10) || false;

  const style = new CssFromQuery(query, [
    ["itembg", "background-color", ".frame-list-item-group"],
    ["itemcolor", "color", ".frame-list-item-group"],
    ["linkcolor", "color", ".frame-list-item-group a"],
    ["regionbg", "background-color", ".frame-list-item-region"],
    ["regioncolor", "color", ".frame-list-item-region"],
    ["itemfontweight", "font-weight", ".frame-list-item-header"],
  ]).getCssRules();

  return {
    filter: filterQuery,
    count,
    sort: sort.spec(),
    hideInterested,
    style,
  };
}

export function GroupListPage() {
  const { t } = useTranslation();
  const options = useOptions();
  const [limit, setLimit] = useState(options.count);

  const [isLoading, groupsList] = useFindFilter(options.filter, limit + 1, undefined, options.sort);

  function groups() {
    return take(groupsList, limit);
  }
  function moreGroups() {
    return groupsList.length > limit;
  }

  return (
    <>
      <MetaTags title={t("group.list.windowtitle", "Groups")} />
      <style>{options.style}</style>

      {groups().length === 0 && (
        <h2 className="mt-5 text-center">
          {t("frame.grouplist.empty", "There is nothing here yet")}
        </h2>
      )}
      {groups().map((group) => (
        <Group key={group._id} group={group} hideInterested={options.hideInterested} />
      ))}
      {isLoading() && <LoadingRow />}
      {moreGroups() && (
        <div className="mt-2 text-center">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              setLimit(limit + 10);
            }}
          >
            {t("_button.more")}
          </button>
        </div>
      )}
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("GroupListPage", () => GroupListPage);

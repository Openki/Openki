import React from "react";
import { useTranslation } from "react-i18next";

import { useFindFilter as useGroupsFindFilter } from "/imports/api/groups/publications";
import { Header } from "./Header";
import { Filtering } from "/imports/utils/filtering";
import { FindParams } from "/imports/api/groups/groups";

export interface Props {
  groupId?: string | undefined;
  isFrame?: boolean | undefined;
  organization?: string | undefined;
  groupsQuery: ReturnType<Filtering<typeof FindParams>["toQuery"]>;
}

export function FindHeader(props: Props) {
  const { t } = useTranslation();

  const [groupsIsLoading, groups] = useGroupsFindFilter(props.groupsQuery);

  function proposeFromQuery() {
    const { search } = props.groupsQuery;
    if (!search) {
      return false;
    }

    return groups.length === 0 && !!search;
  }
  function groupSearch() {
    const { search } = props.groupsQuery;

    return search;
  }

  if (groupsIsLoading()) {
    return null;
  }

  return proposeFromQuery() ? (
    <h2>
      {t("find.proposeNewGroup?", 'Why not propose a new group for "{TERM}"?', {
        TERM: groupSearch(),
      })}
    </h2>
  ) : (
    <Header {...props} />
  );
}

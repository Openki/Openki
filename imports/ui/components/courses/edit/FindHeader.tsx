import React from "react";
import { useTranslation } from "react-i18next";

import { useFindFilter as useGroupsFindFilter } from "/imports/api/courses/publications";
import { Header } from "./Header";
import { useFiltering } from "/imports/utils/filtering";
import { FindParams } from "/imports/api/courses/courses";

export interface Props {
  _id?: string;
  isFrame?: boolean;
  organization?: string;
  groupsQuery: ReturnType<typeof useFiltering<typeof FindParams>>["asQuery"];
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
      {t("find.propose_new_course?", 'Why not propose a new course for "{TERM}"?', {
        TERM: groupSearch(),
      })}
    </h2>
  ) : (
    <Header {...props} />
  );
}

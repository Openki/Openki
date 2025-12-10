import React from "react";
import { useTranslation } from "react-i18next";

import { useFindFilter as useCoursesFindFilter } from "/imports/api/courses/publications";
import { Header } from "./Header";
import { useFiltering } from "/imports/utils/filtering";
import { FindParams } from "/imports/api/courses/courses";

export interface Props {
  _id?: string;
  isFrame?: boolean;
  organization?: string;
  coursesQuery: ReturnType<typeof useFiltering<typeof FindParams>>["asQuery"];
}

export function FindHeader(props: Props) {
  const { t } = useTranslation();

  const [coursesIsLoading, courses] = useCoursesFindFilter(props.coursesQuery);

  function proposeFromQuery() {
    const { search } = props.coursesQuery;
    if (!search) {
      return false;
    }

    return courses.length === 0 && !!search;
  }
  function courseSearch() {
    const { search } = props.coursesQuery;

    return search;
  }

  if (coursesIsLoading()) {
    return null;
  }

  return proposeFromQuery() ? (
    <h2>
      {t("find.propose_new_course?", 'Why not propose a new course for "{TERM}"?', {
        TERM: courseSearch(),
      })}
    </h2>
  ) : (
    <Header {...props} />
  );
}

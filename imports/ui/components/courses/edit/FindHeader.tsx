import React from "react";
import { useTranslation } from "react-i18next";
import { Courses } from "/imports/api/courses/courses";
import { useFindFilter as useCoursesFindFilter } from "/imports/api/courses/publications";
import { Header } from "./Header";

export interface Props {
  _id?: string;
  isFrame?: boolean;
  group?: string;
  filter: ReturnType<(typeof Courses)["Filtering"]>;
}

export function FindHeader(props: Props) {
  const { filter } = props;
  const { t } = useTranslation();

  const filterQuery = filter.toQuery();
  const [coursesIsLoading, courses] = useCoursesFindFilter(filterQuery);

  function proposeFromQuery() {
    const { search } = filterQuery;
    if (!search) {
      return false;
    }

    return courses.length === 0 && search;
  }
  function courseSearch() {
    const filterParams = filter.toParams();

    return filterParams.search;
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

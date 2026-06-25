import React from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";
import { useUserId } from "/imports/utils/react-meteor-data";
import { take } from "lodash-es";

import { SortSpec } from "/imports/utils/sort-spec";
import { LocalizedValue, useLocalizedSetting } from "/imports/utils/getLocalizedValue";

import { ScrollContainer } from "./ScrollContainer";

import { mapping, ListOfEntities, ComponentWithEntities } from "./mapping";

import "./styles.scss";

export interface ComponentSettings {
  entity: keyof typeof mapping;
  title?: LocalizedValue;
  query?: string;
  showAll?: { link?: string; text?: LocalizedValue } | false;
}

export interface Props {
  list: ComponentSettings[];
  defaultRegion?: string | undefined;
  defaultOrganization?: string | undefined;
  limit?: number | undefined;
  fluid?: boolean | undefined;
}

function EntitiesComponent<T>({
  params,
  handler,
  showAll,
  title,
  limit = 10,
  fluid,
}: {
  params: Record<string, string>;
  handler: ListOfEntities<T> | ComponentWithEntities<T>;
  showAll: { link: string | undefined; text: LocalizedValue | undefined } | false;
  title?: LocalizedValue | undefined;
  limit?: number | undefined;
  fluid?: boolean | undefined;
}) {
  const { getLocalizedValue } = useLocalizedSetting();
  const filter = handler.filter();
  filter.read(params);
  const query = filter.toQuery();

  const sortParam = params.sort;
  const sort = sortParam ? SortSpec.fromString(sortParam) : SortSpec.unordered();

  const [isLoading, data] = handler.find(
    query,
    // only have a limit for ListOfEntities but not for ComponentWithEntities
    "element" in handler ? limit + 1 : 900,
    0,
    sort.spec(),
  );

  if (isLoading() || (Array.isArray(data) && data.length === 0)) {
    return null;
  }

  return (
    <div className={`${fluid ? "container-fluid" : "container"} position-relative mb-4`}>
      {showAll !== false && !!showAll?.link && data.length > limit && (
        <a className="btn btn-sm btn-success float-end" href={showAll.link}>
          {getLocalizedValue(showAll.text)}
        </a>
      )}
      {!!title && <h2>{getLocalizedValue(title)}</h2>}
      {"element" in handler ? (
        // ListOfEntities
        <ScrollContainer>
          {take(data, limit).map((d, i) => (
            <handler.element key={i} entity={d} index={i} params={params} />
          ))}
        </ScrollContainer>
      ) : (
        // ComponentWithEntities
        <handler.component entities={data} params={params} />
      )}
    </div>
  );
}

function DashboardComponent({
  settings,
  defaultRegion,
  defaultOrganization,
  limit,
  fluid,
}: {
  settings: ComponentSettings;
  defaultRegion?: string | undefined;
  defaultOrganization?: string | undefined;
  limit?: number | undefined;
  fluid?: boolean | undefined;
}) {
  const { t } = useTranslation();
  const { getLocalizedValue } = useLocalizedSetting();
  const currentUserId = useUserId();

  function generateShowAll(
    config: {
      route?: string;
      showAll?:
        | {
            link?: string;
            text?: string;
          }
        | false
        | undefined;
    },
    urlParams: URLSearchParams,
  ): { link: string | undefined; text: string | undefined } | false {
    if (config.showAll === false || settings.showAll === false) {
      return false;
    }

    return {
      link:
        settings.showAll?.link ||
        ("route" in config && config.route
          ? Router.path(config.route, undefined, { query: urlParams.toString() })
          : undefined),
      text: getLocalizedValue(config.showAll?.text) || t("dashboard.showAll", "Show all >"),
    };
  }

  const handler = mapping[settings.entity];

  if (!currentUserId && settings.query && settings.query.indexOf("{currentUser}") !== -1) {
    // do not show components that need a logged in user.
    return null;
  }

  const queryString = (settings.query || "").replaceAll("{currentUser}", currentUserId || "");

  const urlParams = new URLSearchParams(queryString);
  if (defaultRegion && !urlParams.has("region")) {
    urlParams.append("region", defaultRegion);
  }
  if (defaultOrganization && !urlParams.has("organization")) {
    urlParams.append("organization", defaultOrganization);
  }

  // Convert to params, can not use Object.fromEntries because it breaks on safari on ios.
  const params: Record<string, string> = {};
  urlParams.forEach((value, key) => {
    params[key] = value;
  });

  if (!("filter" in handler)) {
    // StaticComponent
    return <handler.component params={params} />;
  }

  return (
    <EntitiesComponent
      handler={handler as any}
      params={params}
      showAll={generateShowAll(handler, urlParams)}
      title={settings.title}
      limit={limit}
      fluid={fluid}
    />
  );
}

export function Dashboard({ list, defaultRegion, defaultOrganization, limit, fluid }: Props) {
  return (
    <>
      {list.map((h, i) => (
        <DashboardComponent
          key={i}
          settings={h}
          defaultRegion={defaultRegion}
          defaultOrganization={defaultOrganization}
          limit={limit}
          fluid={fluid}
        />
      ))}
    </>
  );
}

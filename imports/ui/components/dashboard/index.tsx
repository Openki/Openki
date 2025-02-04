/* eslint-disable no-nested-ternary */
import React from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";
import { useUserId } from "/imports/utils/react-meteor-data";

import { SortSpec } from "/imports/utils/sort-spec";
import { useLocalizedSetting } from "/imports/utils/getLocalizedValue";

import { mapping, StaticComponent, ListOfEntites, ComponentWithEntites } from "./mapping";

import "./styles.scss";

type ComponentSettings = {
  entity: keyof typeof mapping;
  title?: string;
  query?: string;
  showAll?: { link?: string; text?: string };
};

export type Props = {
  list: ComponentSettings[];
  region?: string | undefined;
  group?: string | undefined;
};

type ListOfEntitesHook<T> = {
  showAll: { link: string | undefined; text: string | undefined };
  entity: string;
  title?: string;
  isLoading: () => boolean;
  params: { [k: string]: string };
  data: T[];
  route: string;
  element: React.FC<{
    entity: T;
    index: number;
    params: {
      [k: string]: string;
    };
  }>;
};

type ComponentWithEntitesHook<T> = {
  showAll: { link: string | undefined; text: string | undefined };
  entity: string;
  title?: string;
  isLoading: () => boolean;
  params: { [k: string]: string };
  data: T[];
  route: string;
  component: React.FC<{
    entities: T[];
    params: {
      [k: string]: string;
    };
  }>;
};

type StaticComponentHook = {
  showAll: { link: string | undefined; text: string | undefined };
  entity: string;
  title?: string;
  params: { [k: string]: string };
  route?: string | undefined;
  component: React.FC<{
    params: {
      [k: string]: string;
    };
  }>;
};

function ListOfEntites1<T>({
  isLoading,
  params,
  data,
  handler,
  urlParams,
  i,
}: {
  isLoading: () => boolean;
  params: { [k: string]: string };
  data: T[];
  handler: ListOfEntites<T>;
  urlParams: URLSearchParams;
  i: any;
}) {
  const { t } = useTranslation();
  const { getLocalizedValue } = useLocalizedSetting();
  function generateShowAll(): { link: string | undefined; text: string | undefined } {
    return {
      link:
        i.showAll?.link ||
        ("route" in handler && handler.route
          ? Router.path(handler.route, undefined, { query: urlParams.toString() })
          : undefined),
      text:
        getLocalizedValue(i.showAll?.text || handler.showAll?.text) ||
        t("dashboard.showAll", "Show all >"),
    };
  }
  function generateListOfEntitesHook(): ListOfEntitesHook<T> {
    return {
      isLoading,
      params,
      data,
      route: handler.route,
      element: handler.element,
      ...i,
      showAll: generateShowAll(),
    };
  }
  const h = generateListOfEntitesHook();
  return (
    <div className="d-flex flex-row flex-nowrap pb-3 overflow-x-scroll">
      {h.data.map((d: any, ii: number) => (
        <h.element entity={d} index={ii} params={h.params} />
      ))}
    </div>
  );
}

function ComponentWithEntites1<T>({
  isLoading,
  params,
  data,
  handler,
  urlParams,
  i,
}: {
  isLoading: () => boolean;
  params: { [k: string]: string };
  data: T[];
  handler: ComponentWithEntites<T>;
  urlParams: URLSearchParams;
  i: any;
}) {
  const { t } = useTranslation();
  const { getLocalizedValue } = useLocalizedSetting();
  function generateShowAll(): { link: string | undefined; text: string | undefined } {
    return {
      link:
        i.showAll?.link ||
        ("route" in handler && handler.route
          ? Router.path(handler.route, undefined, { query: urlParams.toString() })
          : undefined),
      text:
        getLocalizedValue(i.showAll?.text || handler.showAll?.text) ||
        t("dashboard.showAll", "Show all >"),
    };
  }

  function generateComponentWithEntitesHook(): ComponentWithEntitesHook<T> {
    return {
      isLoading,
      params,
      data,
      route: handler.route,
      component: handler.component,
      ...i,
      showAll: generateShowAll(),
    };
  }
  const h = generateComponentWithEntitesHook();
  return <h.component entities={h.data} params={h.params} />;
}

function FilterComponent({
  params,
  handler,
  urlParams,
  i,
}: {
  params: { [k: string]: string };
  handler: any
  urlParams: URLSearchParams;
  i: any;
}) {
  const { getLocalizedValue } = useLocalizedSetting();
  const filter = handler.filter();
  filter.read(params);
  const query = filter.done().toQuery();

  const sortParam = params.sort;
  const sort = sortParam ? SortSpec.fromString(sortParam) : SortSpec.unordered();

  const [isLoading, data] = handler.find(query, 10, 0, sort.spec());

  if (!(!isLoading() && (!Array.isArray(data) || data.length > 0))) {
    return null;
  }

  return (
    <div className="container mb-4">
      {i.showAll?.link && (
        <a className="btn btn-sm btn-success float-end" href={i.showAll.link}>
          {i.showAll.text}
        </a>
      )}
      {i.title && <h2>{getLocalizedValue(i.title)}</h2>}
      {"element" in handler ? (
        <ListOfEntites1
          isLoading={isLoading}
          data={data as any}
          handler={handler as any}
          i={i}
          params={params}
          urlParams={urlParams}
        />
      ) : (
        <ComponentWithEntites1
          isLoading={isLoading}
          data={data as any}
          handler={handler as any}
          i={i}
          params={params}
          urlParams={urlParams}
        />
      )}
    </div>
  );
}

function DashboardComponent({
  settings: i,
  region,
  group,
}: {
  settings: ComponentSettings;
  region?: string | undefined;
  group?: string | undefined;
}) {
  const { t } = useTranslation();
  const { getLocalizedValue } = useLocalizedSetting();
  const currentUserId = useUserId();

  function generateShowAll<T>(
    handler: StaticComponent | ListOfEntites<T> | ComponentWithEntites<T>,
    urlParams: URLSearchParams,
  ): { link: string | undefined; text: string | undefined } {
    return {
      link:
        i.showAll?.link ||
        ("route" in handler && handler.route
          ? Router.path(handler.route, undefined, { query: urlParams.toString() })
          : undefined),
      text:
        getLocalizedValue(i.showAll?.text || handler.showAll?.text) ||
        t("dashboard.showAll", "Show all >"),
    };
  }

  function generateStaticComponentHook(
    params: { [k: string]: string },
    handler: StaticComponent,
    urlParams: URLSearchParams,
  ): StaticComponentHook {
    return {
      params,
      route: handler.route,
      component: handler.component,
      ...i,
      showAll: generateShowAll(handler, urlParams),
    };
  }

  const handler = mapping[i.entity];

  if (!currentUserId && i.query && i.query.indexOf("{currentUser}") !== -1) {
    // do not show components that need a logged in user.
    return null;
  }

  const queryString = (i.query || "").replaceAll("{currentUser}", currentUserId || "");

  const urlParams = new URLSearchParams(queryString);
  if (region) {
    urlParams.append("region", region);
  }
  if (group) {
    urlParams.append("group", group);
  }
  const params = Object.fromEntries(urlParams);

  if (!("filter" in handler)) {
    // A static component
    const h = generateStaticComponentHook(params, handler, urlParams);
    return <h.component params={h.params} />;
  }

  return <FilterComponent handler={handler} i={i} params={params} urlParams={urlParams} />;
}

export function Dashboard({ list, region, group }: Props) {
  return (
    <>
      {list.map((h, i) => (
        <DashboardComponent key={i} settings={h} region={region} group={group} />
      ))}
    </>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("Dashboard", () => Dashboard);

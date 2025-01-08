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
  element: (
    entity: T,
    index: number,
    params: {
      [k: string]: string;
    },
  ) => React.JSX.Element;
};

type ComponentWithEntitesHook<T> = {
  showAll: { link: string | undefined; text: string | undefined };
  entity: string;
  title?: string;
  isLoading: () => boolean;
  params: { [k: string]: string };
  data: T[];
  route: string;
  component: (
    entitys: T[],
    params: {
      [k: string]: string;
    },
  ) => React.JSX.Element;
};

type StaticComponentHook = {
  showAll: { link: string | undefined; text: string | undefined };
  entity: string;
  title?: string;
  params: { [k: string]: string };
  route?: string | undefined;
  component: (params: { [k: string]: string }) => React.JSX.Element;
};

type Hook = ListOfEntitesHook<any> | ComponentWithEntitesHook<any> | StaticComponentHook;

export function Dashboard({ list, region, group }: Props) {
  const { t } = useTranslation();
  const { getLocalizedValue } = useLocalizedSetting();
  const currentUserId = useUserId();

  function generateShowAll<T>(
    i: ComponentSettings,
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

  function generateListOfEntitesHook<T>(
    isLoading: () => boolean,
    params: { [k: string]: string },
    data: T[],
    handler: ListOfEntites<T>,
    i: ComponentSettings,
    urlParams: URLSearchParams,
  ): ListOfEntitesHook<T> {
    return {
      isLoading,
      params,
      data,
      route: handler.route,
      element: handler.element,
      ...i,
      showAll: generateShowAll(i, handler, urlParams),
    };
  }
  function generateComponentWithEntitesHook<T>(
    isLoading: () => boolean,
    params: { [k: string]: string },
    data: T[],
    handler: ComponentWithEntites<T>,
    i: ComponentSettings,
    urlParams: URLSearchParams,
  ): ComponentWithEntitesHook<T> {
    return {
      isLoading,
      params,
      data,
      route: handler.route,
      component: handler.component,
      ...i,
      showAll: generateShowAll(i, handler, urlParams),
    };
  }
  function generateStaticComponentHook(
    params: { [k: string]: string },
    handler: StaticComponent,
    i: ComponentSettings,
    urlParams: URLSearchParams,
  ): StaticComponentHook {
    return {
      params,
      route: handler.route,
      component: handler.component,
      ...i,
      showAll: generateShowAll(i, handler, urlParams),
    };
  }

  const hooks = list.map((i) => {
    const handler = mapping[i.entity];

    if (!currentUserId && i.query && i.query.indexOf("{currentUser}") !== -1) {
      // do not show components that need a logged in user.
      return undefined;
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
      return generateStaticComponentHook(params, handler, i, urlParams);
    }

    const filter = handler.filter();
    filter.read(params);
    const query = filter.done().toQuery();

    const sortParam = params.sort;
    const sort = sortParam ? SortSpec.fromString(sortParam) : SortSpec.unordered();

    const [isLoading, data] = handler.find(query, 10, 0, sort.spec());

    if ("element" in handler) {
      return generateListOfEntitesHook<any>(isLoading, params, data, handler, i, urlParams);
    }

    return generateComponentWithEntitesHook<any>(isLoading, params, data, handler, i, urlParams);
  });

  return (
    <>
      {(hooks.filter((h) => h) as Hook[]).map((h, i) => (
        <React.Fragment key={i}>
          {"isLoading" in h ? (
            !h.isLoading() && (!Array.isArray(h.data) || h.data.length > 0) ? (
              <div className="container mb-4">
                {h.showAll.link ? (
                  <a className="btn btn-sm btn-success float-end" href={h.showAll.link}>
                    {h.showAll.text}
                  </a>
                ) : null}
                {h.title ? <h2>{getLocalizedValue(h.title)}</h2> : null}
                {"element" in h ? (
                  <div className="d-flex flex-row flex-nowrap pb-3 overflow-x-scroll">
                    {h.data.map((d: any, ii: number) => h.element(d, ii, h.params))}
                  </div>
                ) : (
                  h.component(h.data, h.params)
                )}
              </div>
            ) : null
          ) : (
            h.component(h.params)
          )}
        </React.Fragment>
      ))}
    </>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("Dashboard", () => Dashboard);

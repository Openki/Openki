/* eslint-disable no-nested-ternary */
import React from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";
import { useUserId } from "/imports/utils/react-meteor-data";

import { SortSpec } from "/imports/utils/sort-spec";
import { useLocalizedSetting } from "/imports/utils/getLocalizedValue";

import { mapping, ListOfEntites, ComponentWithEntites } from "./mapping";

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

function ListOfEntitesComponent<T>({
  params,
  data,
  handler,
}: {
  params: { [k: string]: string };
  data: T[];
  handler: ListOfEntites<T>;
}) {
  return (
    <div className="d-flex flex-row flex-nowrap pb-3 overflow-x-scroll">
      {data.map((d, ii: number) => (
        <handler.element key={ii} entity={d} index={ii} params={params} />
      ))}
    </div>
  );
}

function WithEntitesComponent<T>({
  params,
  data,
  handler,
}: {
  params: { [k: string]: string };
  data: T[];
  handler: ComponentWithEntites<T>;
}) {
  return <handler.component entities={data} params={params} />;
}

function FilterComponent({
  params,
  handler,
  showAll,
  i,
}: {
  params: { [k: string]: string };
  handler: any;
  showAll: { link: string | undefined; text: string | undefined };
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
      {showAll?.link && (
        <a className="btn btn-sm btn-success float-end" href={showAll.link}>
          {showAll.text}
        </a>
      )}
      {i.title && <h2>{getLocalizedValue(i.title)}</h2>}
      {"element" in handler ? (
        <ListOfEntitesComponent data={data} handler={handler} params={params} />
      ) : (
        <WithEntitesComponent data={data} handler={handler} params={params} />
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

  function generateShowAll(
    config: {
      route?: string;
      showAll?:
        | {
            link?: string;
            text?: string;
          }
        | undefined;
    },
    urlParams: URLSearchParams,
  ): { link: string | undefined; text: string | undefined } {
    return {
      link:
        i.showAll?.link ||
        ("route" in config && config.route
          ? Router.path(config.route, undefined, { query: urlParams.toString() })
          : undefined),
      text:
        getLocalizedValue(i.showAll?.text || config.showAll?.text) ||
        t("dashboard.showAll", "Show all >"),
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
    return <handler.component params={params} />;
  }

  return (
    <FilterComponent
      handler={handler}
      i={i}
      params={params}
      showAll={generateShowAll(handler, urlParams)}
    />
  );
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

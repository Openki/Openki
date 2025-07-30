/* eslint-disable no-nested-ternary */
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";
import { useUserId } from "/imports/utils/react-meteor-data";

import { SortSpec } from "/imports/utils/sort-spec";
import { useLocalizedSetting } from "/imports/utils/getLocalizedValue";

import { mapping, ListOfEntities, ComponentWithEntities } from "./mapping";

import "./styles.scss";

interface ComponentSettings {
  entity: keyof typeof mapping;
  title?: string;
  query?: string;
  showAll?: { link?: string; text?: string } | false;
}

export interface Props {
  list: ComponentSettings[];
  region?: string | undefined;
  group?: string | undefined;
}

function EntitiesComponent<T>({
  params,
  handler,
  showAll,
  title,
}: {
  params: Record<string, string>;
  handler: ListOfEntities<T> | ComponentWithEntities<T>;
  showAll: { link: string | undefined; text: string | undefined } | false;
  title?: string | undefined;
}) {
  const { getLocalizedValue } = useLocalizedSetting();
  const filter = handler.filter();
  filter.read(params);
  const query = filter.toQuery();

  const sortParam = params.sort;
  const sort = sortParam ? SortSpec.fromString(sortParam) : SortSpec.unordered();

  const [isLoading, data] = handler.find(query, 10, 0, sort.spec());

  const elementRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(elementRef.current?.scrollLeft || 0);
  const [scrollLeftMax, setScrollLeftMax] = useState(0);

  if (!(!isLoading() && (!Array.isArray(data) || data.length > 0))) {
    return null;
  }

  return (
    <div className="container position-relative mb-4">
      {showAll !== false && !!showAll?.link && (
        <a className="btn btn-sm btn-success float-end" href={showAll.link}>
          {showAll.text}
        </a>
      )}
      {!!title && <h2>{getLocalizedValue(title)}</h2>}
      {"element" in handler ? (
        // ListOfEntities
        <div
          className="scroll-container d-flex flex-row flex-nowrap pb-3 overflow-x-auto"
          style={{ scrollBehavior: "smooth" }}
          ref={elementRef}
          onScroll={() => {
            setScrollLeft(elementRef.current?.scrollLeft || 0);
          }}
          onMouseOver={() => {
            const element = elementRef.current;
            if (element) {
              if (element.scrollWidth - element.clientWidth !== scrollLeftMax) {
                setScrollLeftMax(element.scrollWidth - element.clientWidth);
              }
            }
          }}
        >
          {data.map((d, i) => (
            <handler.element key={i} entity={d} index={i} params={params} />
          ))}
          {scrollLeft !== 0 && (
            <a
              className="btn-scroll btn-scroll-left text-primary"
              onClick={() => {
                const element = elementRef.current;
                if (element) {
                  element.scrollLeft = element.scrollLeft - element.clientWidth * 0.66;
                }
              }}
            >
              <i className="fa-solid fa-angle-left fa-fw" aria-hidden="true"></i>
            </a>
          )}
          {elementRef.current &&
            scrollLeft !== elementRef.current.scrollWidth - elementRef.current.clientWidth && (
              <a
                className="btn-scroll btn-scroll-right text-primary"
                onClick={() => {
                  const element = elementRef.current;
                  if (element) {
                    element.scrollLeft = element.scrollLeft + element.clientWidth * 0.66;
                  }
                }}
              >
                <i className="fa-solid fa-angle-right fa-fw" aria-hidden="true"></i>
              </a>
            )}
        </div>
      ) : (
        // ComponentWithEntities
        <handler.component entities={data} params={params} />
      )}
    </div>
  );
}

function DashboardComponent({
  settings,
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
      text:
        getLocalizedValue(config.showAll?.text || config.showAll?.text) ||
        t("dashboard.showAll", "Show all >"),
    };
  }

  const handler = mapping[settings.entity];

  if (!currentUserId && settings.query && settings.query.indexOf("{currentUser}") !== -1) {
    // do not show components that need a logged in user.
    return null;
  }

  const queryString = (settings.query || "").replaceAll("{currentUser}", currentUserId || "");

  const urlParams = new URLSearchParams(queryString);
  if (region) {
    urlParams.append("region", region);
  }
  if (group) {
    urlParams.append("group", group);
  }
  const params = Object.fromEntries(Array.from(urlParams.entries()));

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

import "./template.html";

Template.registerHelper("Dashboard", () => Dashboard);

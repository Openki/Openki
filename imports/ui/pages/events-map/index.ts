import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { i18n } from "/imports/startup/both/i18next";

import { Regions } from "/imports/api/regions/regions";
import { EventEntity, EventModel } from "/imports/api/events/events";

import * as Metatags from "/imports/utils/metatags";

import type { MarkerEntity } from "/imports/ui/components/map2";

import "/imports/ui/components/map2";

import "./template.html";
import "./styles.scss";

const groupBy = <T>(array: T[], predicate: (value: T, index: number, array: T[]) => string) =>
  array.reduce(
    // eslint-disable-next-line @typescript-eslint/no-shadow
    (acc, value, index, array) => {
      (acc[predicate(value, index, array)] ||= []).push(value);
      return acc;
    },
    {} as { [key: string]: T[] },
  );

export interface Data {
  region: string | undefined;
  events: Mongo.Cursor<EventEntity, EventModel>;
}

const Template = TemplateAny as TemplateStaticTyped<"eventsMapPage", Data>;

const template = Template.eventsMapPage;

template.onCreated(function () {
  const instance = this;

  instance.autorun(() => {
    Metatags.setCommonTags(i18n("eventsMap.windowtitle", "Events map"));
  });
});

template.helpers({
  markers() {
    const markers = Object.entries(
      groupBy(
        Template.instance()
          .data.events.fetch()
          .filter((e) => e.venue?._id),
        (e) => e.venue?._id as string,
      ),
    ).map((g) => ({
      loc: g[1][0].venue?.loc,
      content: g[1][0].venue?.name + ": " + g[1].map((event) => event.title).join(),
    }));
    markers.push(
      ...Template.instance()
        .data.events.fetch()
        .filter((e) => !e.venue?._id)
        .map((event) => {
          return {
            loc: event.venue?.loc,
            content: event.title,
          } as any;
        }),
    );
    return markers;
  },

  regionName() {
    const { region } = Template.instance().data;
    return Regions.findOne(region)?.name || false;
  },
});

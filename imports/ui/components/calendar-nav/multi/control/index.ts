import { i18n } from "/imports/startup/both/i18next";
import { Session } from "meteor/session";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { Spacebars } from "meteor/spacebars";

import "./template.html";

const units = ["week", "month", "year"] as const;

export type Direction = "previous" | "next";
export type Unit = (typeof units)[number];

const Template = TemplateAny as TemplateStaticTyped<
  "calendarNavMultiControl",
  {
    unit: Unit;
    direction: Direction;
    onChangeDate: () => void;
    onChangeUnit: (value: Unit) => void;
  }
>;

const template = Template.calendarNavMultiControl;

template.events({
  "click .js-change-date"(event, instance) {
    event.preventDefault();
    instance.data.onChangeDate();
  },

  "click .js-change-unit"(this: Unit, event, instance) {
    event.preventDefault();
    instance.data.onChangeUnit(this);
  },
});

template.helpers({
  arrow() {
    const data = Template.currentData();

    let isRTL = Session.equals("textDirectionality", "rtl");

    if (data.direction === "previous") {
      isRTL = !isRTL;
    }

    const direction = isRTL ? "left" : "right";
    return Spacebars.SafeString(
      `<span class="fa-solid fa-arrow-${direction} fa-fw" aria-hidden="true"></span>`
    );
  },

  calendarNavText(direction: string, unit: string, length: string) {
    return i18n(`calendar.${direction}.${unit}.${length}`);
  },

  units() {
    return units;
  },
});

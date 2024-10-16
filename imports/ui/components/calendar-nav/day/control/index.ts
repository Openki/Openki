import { i18n } from "/imports/startup/both/i18next";
import { Session } from "meteor/session";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { Spacebars } from "meteor/spacebars";

import "/imports/ui/components/search-field";
import "/imports/ui/components/filter-groups";
import "/imports/ui/components/filter-categories";

import "./template.html";
import { Data } from "..";

type Direction = "previous" | "next";

const Template = TemplateAny as TemplateStaticTyped<
  "calendarNavDayControl",
  { direction: Direction }
>;

const template = Template.calendarNavDayControl;

template.events({
  "click .js-change-date"(event, instance) {
    event.preventDefault();

    const parentData = instance.parentInstance()?.data as Data;

    const amount = instance.data.direction === "previous" ? -1 : 1;

    const newDate = parentData.date.add(amount, "day");

    parentData.onChangeDate(newDate);
  },
});

template.helpers({
  arrow() {
    const data = Template.instance().data;

    let isRTL = Session.equals("textDirectionality", "rtl");

    if (data.direction === "previous") {
      isRTL = !isRTL;
    }

    const direction = isRTL ? "left" : "right";
    return Spacebars.SafeString(
      `<span class="fa-solid fa-arrow-${direction} fa-fw" aria-hidden="true"></span>`,
    );
  },

  text(direction: string, length: string) {
    return i18n(`calendar.${direction}.day.${length}`);
  },
});

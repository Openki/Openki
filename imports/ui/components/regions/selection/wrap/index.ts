import { ReactiveDict } from "meteor/reactive-dict";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { Regions } from "/imports/api/regions/regions";

import "..";

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<
  "regionSelectionWrap",
  Record<string, unknown>,
  { state: ReactiveDict<{ searchingRegions: boolean }> }
>;

const template = Template.regionSelectionWrap;

template.onCreated(function () {
  const instance = this;

  instance.subscribe("Regions");
  instance.state = new ReactiveDict();
  instance.state.setDefault("searchingRegions", false);
});

template.helpers({
  hasMultipleRegions() {
    return Regions.findFilter({}, 2).count() > 1;
  },

  regionSelectionDisplayAttr() {
    const instance = Template.instance();
    return {
      inNavbar: this.inNavbar,
      onClick: () => {
        instance.state.set("searchingRegions", true);
      },
    };
  },
});

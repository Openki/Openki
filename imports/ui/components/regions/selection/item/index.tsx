import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { RegionModel } from "/imports/api/regions/regions";

import * as StringTools from "/imports/utils/string-tools";

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<"regionSelectionItem">;

const template = Template.regionSelectionItem;

template.helpers({
  regionNameMarked(this: RegionModel) {
    const search = (Template.instance().parentInstance() as any).state.get("search");
    return StringTools.markedName(search, this.name);
  },
  private() {
    return this.isPrivate() ? "region-link-private" : "";
  },
});

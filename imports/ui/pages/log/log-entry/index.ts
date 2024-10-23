import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import moment from "moment";

import * as TemplateMixins from "/imports/ui/lib/template-mixins";

import "./template.html";
import "./styles.scss";

const Template = TemplateAny as TemplateStaticTyped<"logEntry">;

const template = TemplateMixins.MultiExpandible(Template, "logEntry");

template.helpers({
  shortId(id: string) {
    return id.substring(0, 8);
  },
  isodate(date: moment.Moment) {
    return moment(date).toISOString();
  },
  jsonBody() {
    return JSON.stringify(this.body, null, "   ");
  },
  jsonFull() {
    return JSON.stringify(this, null, "   ");
  },
});

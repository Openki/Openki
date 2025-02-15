import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import "/imports/ui/components/language-selection";

import "./template.html";
import "./styles.scss";

const Template = TemplateAny as TemplateStaticTyped<"kioskEvent">;

const template = Template.kioskEvent;
template.helpers({
  timePeriod() {
    return (Template.instance().parentInstance() as any).data.timePeriod;
  },

  isOngoing() {
    return (Template.instance().parentInstance() as any).timePeriod === "ongoing";
  },

  isUpcoming() {
    return (Template.instance().parentInstance() as any).timePeriod === "upcoming";
  },
});

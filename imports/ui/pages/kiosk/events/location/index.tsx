import { Router } from "meteor/iron:router";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import "/imports/ui/components/language-selection";

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<"kioskEventLocation">;
const template = Template.kioskEventLocation;
template.helpers({
  showLocation() {
    // The location is shown when we have a location name and the location is not used as a filter
    return this.location?.name && !Router.current().params.query.location;
  },
});

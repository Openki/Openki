import { Session } from "meteor/session";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import "/imports/ui/components/regions/selection/wrap";

import "./template.html";
import "./styles.scss";

const Template = TemplateAny as TemplateStaticTyped<"regionSplash">;

const template = Template.regionSplash;

template.onRendered(function () {
  this.$(".js-region-splash").modal("show");
});

template.events({
  "hidden.bs.modal .js-region-splash"() {
    Session.set("showRegionSplash", false);
  },

  "click .js-region-link"(_event, instance) {
    instance.$(".js-region-splash").modal("hide");
  },

  "click .js-region-search"(event, instance) {
    instance.$(event.currentTarget as any).trigger("select");
  },

  "click .js-confirm-region"(_event, instance) {
    instance.$(".js-region-splash").modal("hide");
  },

  "click .js-login-for-region"(_event, instance) {
    instance.$(".js-region-splash").modal("hide");
  },
});

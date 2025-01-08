import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import { Router } from "meteor/iron:router";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { Regions } from "/imports/api/regions/regions";

import * as RegionSelection from "/imports/utils/region-selection";
import { Introduction } from "/imports/ui/lib/introduction";
import { ScssVars } from "/imports/ui/lib/scss-vars";
import * as Viewport from "/imports/ui/lib/viewport";
import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import * as Tooltips from "/imports/utils/Tooltips";
import * as FormsValidation from "/imports/utils/FormsValidation";

import "/imports/ui/layouts/root.html";
import "/imports/ui/components/account-tasks";
import "/imports/ui/components/alerts";
import "/imports/ui/components/email-validation";
import "/imports/ui/components/featured-group";
import "/imports/ui/components/footer";
import "/imports/ui/components/introduction";
import "/imports/ui/components/kiosk-link";
import "/imports/ui/components/navbar";
import "/imports/ui/components/regions/splash";

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<"layout">;

const template = Template.layout;

template.helpers({
  showRegionSplash() {
    const { route } = Router.current();
    if (!route) {
      return false;
    }

    return (
      RegionSelection.regionDependentRoutes.includes(route.getName()) &&
      Session.equals("showRegionSplash", true)
    );
  },

  resetPasswortEmailSended() {
    return Router.current().params.query?.action === "resetPasswortEmailSended";
  },

  hasPricePolicy() {
    return !Regions.currentRegion()?.isPrivate();
  },

  isAdminPage() {
    return Router.current().url.includes("admin");
  },

  isAdmin() {
    return Meteor.user()?.privileged("admin");
  },

  isNotAdminPanel() {
    const { route } = Router.current();
    return !(route?.getName() === "adminPanel");
  },
});

template.events({
  // Clicks on the logo toggle the intro blurb, but only when already on home
  "click .js-toggle-introduction"() {
    const { route } = Router.current();
    if (route?.getName() === "home") {
      Introduction.showIntro();
    }
  },
});

template.onRendered(() => {
  Viewport.update();
  window.addEventListener("resize", () => {
    Viewport.update();
  });
  Session.set("isRetina", window.devicePixelRatio === 2);
  Tooltips.enable();
  FormsValidation.enable();
});

template.events({
  /* Workaround to prevent iron-router from messing with server-side downloads
   *
   * Class 'js-download' must be added to those links.
   */
  "click .js-download"(event) {
    event.stopPropagation();
  },
});

routerAutoscroll.marginTop = ScssVars.navbarHeight;
